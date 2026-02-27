import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { convertWhapiNumber, sendWhapiMessage } from "./whapi-service.js";
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_MAX_ATTEMPTS = 3;
const getBatchSize = () => {
    const value = Number(process.env.WHAPI_BATCH_SIZE ?? DEFAULT_BATCH_SIZE);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_BATCH_SIZE;
};
const getMaxAttempts = () => {
    const value = Number(process.env.WHAPI_MAX_ATTEMPTS ?? DEFAULT_MAX_ATTEMPTS);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_ATTEMPTS;
};
let isRunning = false;
const buildErrorMessage = (value) => {
    if (!value)
        return "Unknown error";
    if (value instanceof Error)
        return value.message;
    try {
        return JSON.stringify(value);
    }
    catch (error) {
        return String(value);
    }
};
const markOutboxFailed = async (id, attempts, lastError) => {
    const maxAttempts = getMaxAttempts();
    const status = attempts >= maxAttempts ? "FAILED" : "PENDING";
    await prismaFlowly.caseNotificationOutbox.update({
        where: { caseNotificationId: id },
        data: {
            attempts,
            lastError,
            status,
            provider: "WHAPI",
            updatedAt: new Date(),
            updatedBy: "SYSTEM",
        },
    });
};
const markOutboxSent = async (id, attempts) => {
    await prismaFlowly.caseNotificationOutbox.update({
        where: { caseNotificationId: id },
        data: {
            attempts,
            lastError: null,
            status: "SENT",
            provider: "WHAPI",
            updatedAt: new Date(),
            updatedBy: "SYSTEM",
        },
    });
};
const persistFinalMessage = async (id, message) => {
    await prismaFlowly.caseNotificationOutbox.update({
        where: { caseNotificationId: id },
        data: {
            message,
            updatedAt: new Date(),
            updatedBy: "SYSTEM",
        },
    });
};
const normalizeRole = (value) => (value ?? "").trim().toUpperCase();
const normalizeChannel = (value) => (value ?? "").trim().toUpperCase();
const normalizeAction = (value) => {
    const trimmed = (value ?? "").trim().toUpperCase();
    return trimmed.length > 0 ? trimmed : null;
};
const normalizeCaseType = (value) => {
    const trimmed = (value ?? "").trim().toUpperCase();
    return trimmed.length > 0 ? trimmed : null;
};
const parseMeta = (value) => {
    if (!value)
        return {};
    try {
        return JSON.parse(value);
    }
    catch (error) {
        return {};
    }
};
const buildCaseLabel = (caseType) => caseType === "PROJECT" ? "project" : "masalah";
const renderTemplate = (template, context) => template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = context[key];
    if (value === undefined || value === null)
        return "";
    return String(value);
});
const resolveCustomTemplate = async (params) => {
    const role = normalizeRole(params.role);
    if (!role || !params.recipientEmployeeId)
        return null;
    const client = prismaFlowly;
    if (params.caseDepartmentId) {
        const byDepartment = await client.caseNotificationMessage.findFirst({
            where: {
                isDeleted: false,
                isActive: true,
                caseDepartmentId: params.caseDepartmentId,
                recipientEmployeeId: params.recipientEmployeeId,
                role,
            },
            orderBy: { updatedAt: "desc" },
        });
        if (byDepartment)
            return byDepartment;
    }
    if (params.caseId) {
        const byCase = await client.caseNotificationMessage.findFirst({
            where: {
                isDeleted: false,
                isActive: true,
                caseId: params.caseId,
                recipientEmployeeId: params.recipientEmployeeId,
                role,
            },
            orderBy: { updatedAt: "desc" },
        });
        if (byCase)
            return byCase;
    }
    return null;
};
const resolveDefaultTemplate = async (params) => {
    const role = normalizeRole(params.role);
    const channel = normalizeChannel(params.channel);
    const action = normalizeAction(params.action);
    const caseType = normalizeCaseType(params.caseType);
    if (!role || !channel)
        return null;
    const client = prismaFlowly;
    const findTemplate = (filters) => client.caseNotificationTemplate.findFirst({
        where: {
            isDeleted: false,
            isActive: true,
            channel,
            role,
            ...filters,
        },
        orderBy: { updatedAt: "desc" },
    });
    if (action) {
        const byAction = await findTemplate({ action, caseType: caseType ?? null });
        if (byAction)
            return byAction;
        if (caseType) {
            const byActionGeneral = await findTemplate({ action, caseType: null });
            if (byActionGeneral)
                return byActionGeneral;
        }
    }
    const byDefault = await findTemplate({ action: null, caseType: caseType ?? null });
    if (byDefault)
        return byDefault;
    if (caseType) {
        return findTemplate({ action: null, caseType: null });
    }
    return null;
};
const buildTemplateContext = async (item) => {
    const meta = parseMeta(item.meta);
    const role = normalizeRole(typeof meta.role === "string" ? meta.role : undefined);
    const action = normalizeAction(typeof meta.action === "string" ? meta.action : undefined);
    const resolveNameByIds = async (userId, employeeId) => {
        if (employeeId) {
            const employee = await prismaEmployee.em_employee.findUnique({
                where: { UserId: employeeId },
                select: { Name: true },
            });
            if (employee?.Name)
                return employee.Name;
        }
        if (userId) {
            const user = await prismaFlowly.user.findUnique({
                where: { userId },
                select: { name: true },
            });
            if (user?.name)
                return user.name;
            const numericId = Number(userId);
            if (Number.isFinite(numericId)) {
                const employee = await prismaEmployee.em_employee.findUnique({
                    where: { UserId: numericId },
                    select: { Name: true },
                });
                if (employee?.Name)
                    return employee.Name;
            }
        }
        return "";
    };
    const caseHeader = item.caseId
        ? await prismaFlowly.caseHeader.findUnique({
            where: { caseId: item.caseId },
            select: {
                caseTitle: true,
                caseType: true,
                requesterId: true,
                requesterEmployeeId: true,
                originSbuSubId: true,
            },
        })
        : null;
    let sbuSubName = typeof meta.sbuSubName === "string" ? meta.sbuSubName : "";
    let sbuSubCode = typeof meta.sbuSubCode === "string" ? meta.sbuSubCode : "";
    let sbuSubId = typeof meta.sbuSubId === "number" ? meta.sbuSubId : null;
    let departmentSbuSubId = null;
    let assignedBy = null;
    let departmentCreatedBy = null;
    let decisionStatus = null;
    let decisionNotes = null;
    let decisionBy = null;
    if (item.caseDepartmentId) {
        const dept = await prismaFlowly.caseDepartment.findUnique({
            where: { caseDepartmentId: item.caseDepartmentId },
            select: {
                sbuSubId: true,
                assignedBy: true,
                createdBy: true,
                decisionStatus: true,
                decisionNotes: true,
                decisionBy: true,
            },
        });
        if (dept) {
            departmentSbuSubId = dept.sbuSubId;
            assignedBy = dept.assignedBy ?? null;
            departmentCreatedBy = dept.createdBy ?? null;
            decisionStatus = dept.decisionStatus ?? null;
            decisionNotes = dept.decisionNotes ?? null;
            decisionBy = dept.decisionBy ?? null;
            if (!sbuSubId) {
                sbuSubId = dept.sbuSubId;
            }
        }
    }
    const resolvedSbuSubId = sbuSubId ?? departmentSbuSubId;
    if ((!sbuSubName || !sbuSubCode) && resolvedSbuSubId) {
        const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
            where: {
                id: resolvedSbuSubId,
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { sbu_sub_name: true, sbu_sub_code: true },
        });
        if (sbuSub) {
            if (!sbuSubName) {
                sbuSubName = sbuSub.sbu_sub_name;
            }
            if (!sbuSubCode) {
                sbuSubCode = sbuSub.sbu_sub_code ?? "";
            }
        }
    }
    const originSbuSubId = typeof caseHeader?.originSbuSubId === "number"
        ? caseHeader.originSbuSubId
        : null;
    let originSbuSubName = "";
    let originSbuSubCode = "";
    if (originSbuSubId) {
        if (originSbuSubId === resolvedSbuSubId && (sbuSubName || sbuSubCode)) {
            originSbuSubName = sbuSubName;
            originSbuSubCode = sbuSubCode;
        }
        else {
            const originSbuSub = await prismaEmployee.em_sbu_sub.findFirst({
                where: {
                    id: originSbuSubId,
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { sbu_sub_name: true, sbu_sub_code: true },
            });
            if (originSbuSub) {
                originSbuSubName = originSbuSub.sbu_sub_name;
                originSbuSubCode = originSbuSub.sbu_sub_code ?? "";
            }
        }
    }
    const recipient = item.recipientEmployeeId !== null && item.recipientEmployeeId !== undefined
        ? await prismaEmployee.em_employee.findUnique({
            where: { UserId: item.recipientEmployeeId },
            select: { Name: true },
        })
        : null;
    const requesterUserId = caseHeader?.requesterId ?? "";
    const requesterEmployeeId = caseHeader?.requesterEmployeeId ?? null;
    let requesterName = "";
    if (requesterEmployeeId) {
        const requesterEmployee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: requesterEmployeeId },
            select: { Name: true },
        });
        requesterName = requesterEmployee?.Name ?? "";
    }
    if (!requesterName && requesterUserId) {
        const requesterUser = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            select: { name: true },
        });
        requesterName = requesterUser?.name ?? "";
    }
    const assignerUserId = assignedBy ?? "";
    const assignerName = assignerUserId
        ? await resolveNameByIds(assignerUserId, null)
        : "";
    const adderUserId = departmentCreatedBy ?? "";
    const adderName = adderUserId
        ? await resolveNameByIds(adderUserId, null)
        : "";
    const decisionByUserId = decisionBy ?? "";
    const decisionByName = decisionByUserId
        ? await resolveNameByIds(decisionByUserId, null)
        : "";
    const decisionStatusValue = decisionStatus ?? "";
    const decisionNotesValue = decisionNotes ?? "";
    let senderUserId = requesterUserId;
    let senderName = requesterName;
    if (action === "ASSIGN_TASK") {
        senderUserId = assignerUserId || requesterUserId;
        senderName = assignerName || requesterName;
    }
    else if (action === "ADD_DEPARTMENT") {
        senderUserId = adderUserId || requesterUserId;
        senderName = adderName || requesterName;
    }
    else if (action === "DECISION") {
        senderUserId = decisionByUserId || requesterUserId;
        senderName = decisionByName || requesterName;
    }
    return {
        caseId: item.caseId ?? "",
        caseDepartmentId: item.caseDepartmentId ?? "",
        caseTitle: caseHeader?.caseTitle ?? "",
        caseType: caseHeader?.caseType ?? "",
        caseTypeLabel: buildCaseLabel(caseHeader?.caseType),
        originSbuSubId: originSbuSubId ?? "",
        originSbuSubName,
        originSbuSubCode,
        sbuSubId: resolvedSbuSubId ?? "",
        sbuSubName,
        sbuSubCode,
        recipientEmployeeId: item.recipientEmployeeId ?? "",
        recipientName: recipient?.Name ?? "",
        requesterUserId,
        requesterEmployeeId: requesterEmployeeId ?? "",
        requesterName,
        adderUserId,
        adderName,
        assignerUserId,
        assignerName,
        assignerSbuSubId: resolvedSbuSubId ?? "",
        assignerSbuSubName: sbuSubName,
        assignerSbuSubCode: sbuSubCode,
        decisionStatus: decisionStatusValue,
        decisionNotes: decisionNotesValue,
        decisionByUserId,
        decisionByName,
        senderUserId,
        senderName,
        role,
        action: action ?? "",
    };
};
const dispatchOutboxItem = async (item) => {
    const attempts = item.attempts + 1;
    if (!item.phoneNumber) {
        await markOutboxFailed(item.caseNotificationId, attempts, "Missing phone number");
        return;
    }
    let message = "";
    try {
        const meta = parseMeta(item.meta);
        const metaRole = meta.role;
        let context = null;
        const getContext = async () => {
            if (!context) {
                context = await buildTemplateContext(item);
            }
            return context;
        };
        const customTemplate = await resolveCustomTemplate({
            caseId: item.caseId ?? null,
            caseDepartmentId: item.caseDepartmentId ?? null,
            recipientEmployeeId: item.recipientEmployeeId ?? null,
            role: typeof metaRole === "string" ? metaRole : null,
        });
        if (customTemplate?.messageTemplate) {
            const contextValue = await getContext();
            message = renderTemplate(customTemplate.messageTemplate, contextValue);
        }
        else {
            const contextValue = await getContext();
            const defaultTemplate = await resolveDefaultTemplate({
                channel: item.channel,
                role: typeof metaRole === "string" ? metaRole : null,
                action: typeof meta.action === "string" ? meta.action : null,
                caseType: typeof contextValue.caseType === "string" ? contextValue.caseType : null,
            });
            if (defaultTemplate?.messageTemplate) {
                message = renderTemplate(defaultTemplate.messageTemplate, contextValue);
            }
        }
    }
    catch (error) {
        logger.warn("Failed to resolve notification template", {
            caseNotificationId: item.caseNotificationId,
            error: buildErrorMessage(error),
        });
    }
    if (!message.trim()) {
        await markOutboxFailed(item.caseNotificationId, attempts, "Missing notification template");
        return;
    }
    if (message !== item.message) {
        try {
            await persistFinalMessage(item.caseNotificationId, message);
        }
        catch (error) {
            logger.warn("Failed to persist final notification message", {
                caseNotificationId: item.caseNotificationId,
                error: buildErrorMessage(error),
            });
        }
    }
    const convertResult = await convertWhapiNumber(item.phoneNumber);
    if (!convertResult.ok || !convertResult.number) {
        await markOutboxFailed(item.caseNotificationId, attempts, buildErrorMessage(convertResult.error));
        return;
    }
    const sendResult = await sendWhapiMessage(convertResult.number, message);
    if (!sendResult.ok) {
        await markOutboxFailed(item.caseNotificationId, attempts, buildErrorMessage(sendResult.data ?? sendResult.error));
        return;
    }
    await markOutboxSent(item.caseNotificationId, attempts);
};
export const processNotificationOutbox = async () => {
    if (isRunning)
        return;
    isRunning = true;
    try {
        const batchSize = getBatchSize();
        const maxAttempts = getMaxAttempts();
        const items = await prismaFlowly.caseNotificationOutbox.findMany({
            where: {
                isDeleted: false,
                channel: "WHATSAPP",
                status: "PENDING",
                attempts: { lt: maxAttempts },
            },
            orderBy: { createdAt: "asc" },
            take: batchSize,
            select: {
                caseNotificationId: true,
                phoneNumber: true,
                message: true,
                attempts: true,
                channel: true,
                caseId: true,
                caseDepartmentId: true,
                recipientEmployeeId: true,
                meta: true,
            },
        });
        for (const item of items) {
            try {
                await dispatchOutboxItem(item);
            }
            catch (error) {
                logger.warn("Failed to dispatch notification", {
                    caseNotificationId: item.caseNotificationId,
                    error: buildErrorMessage(error),
                });
                await markOutboxFailed(item.caseNotificationId, item.attempts + 1, buildErrorMessage(error));
            }
        }
    }
    catch (error) {
        logger.error("Failed to process notification outbox", {
            error: buildErrorMessage(error),
        });
    }
    finally {
        isRunning = false;
    }
};
//# sourceMappingURL=case-notification-dispatcher.js.map