import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { NotificationTemplateValidation } from "../validation/notification-template-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateNotificationTemplateId, generateNotificationTemplatePortalId, generateNotificationOutboxId, } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { dispatchGenericNotificationOutboxItem } from "./generic-notification-dispatcher.js";
import { toNotificationTemplateListResponse, toNotificationTemplateResponse, } from "../model/notification-template-model.js";
const CHANNEL_WHATSAPP = "WHATSAPP";
const EMPLOYEE_REFERENCE_TYPE = "EMPLOYEE";
const PARTICIPANT_RECIPIENT_ROLE = "PARTICIPANT";
const TEST_PORTAL_KEY = "ADMINISTRATOR";
const TEST_EVENT_KEY = "WA_SERVICE_TEST";
const TEST_RECIPIENT_ROLE = "EXAM_MONITOR";
const TEST_CONTEXT_REFERENCE_TYPE = "WHATSAPP_SERVICE_TEST";
const DEFAULT_MANUAL_PORTAL_KEY = "EMPLOYEE";
const MANUAL_CONTEXT_REFERENCE_TYPE = "ADMIN_MANUAL_NOTIFICATION";
const MANUAL_SOURCE = "ADMIN_NOTIFICATION_TEMPLATE_MANUAL_SEND";
const normalizeUpper = (value) => value.trim().toUpperCase();
const normalizeOptionalText = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
};
const normalizePhone = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D+/g, "");
    return digits.length > 0 ? digits : null;
};
const normalizePortalKeys = (values) => [...new Set((values ?? []).map((value) => normalizeUpper(value)).filter(Boolean))].sort();
const normalizeEmail = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "-" ? trimmed : null;
};
const resolveTemporaryPassword = (value) => {
    const trimmed = value?.trim();
    if (!trimmed)
        return "";
    if (trimmed.startsWith("$2a$") ||
        trimmed.startsWith("$2b$") ||
        trimmed.startsWith("$2y$")) {
        return "";
    }
    return trimmed;
};
const formatDateForNotification = (value) => value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});
const formatOptionalDateForNotification = (value) => value ? formatDateForNotification(value) : "Tanpa batas waktu";
const resolveOmsLoginUrl = () => {
    const directUrl = normalizeOptionalText(process.env.OMS_LOGIN_URL);
    if (directUrl) {
        return directUrl;
    }
    const baseUrl = normalizeOptionalText(process.env.OMS_APP_BASE_URL);
    if (baseUrl) {
        const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
        return /\/oms$/i.test(normalizedBaseUrl)
            ? `${normalizedBaseUrl}/login`
            : `${normalizedBaseUrl}/oms/login`;
    }
    return "http://localhost:5173/oms/login";
};
const resolveHrdDecisionUrl = () => {
    const loginUrl = resolveOmsLoginUrl();
    if (/\/login$/i.test(loginUrl)) {
        return loginUrl.replace(/\/login$/i, "/employee");
    }
    return `${loginUrl.replace(/\/+$/, "")}/employee`;
};
const resolveSupportName = () => normalizeOptionalText(process.env.OMS_SUPPORT_NAME) ?? "";
const resolveSupportPhone = () => normalizeOptionalText(process.env.OMS_SUPPORT_PHONE) ?? "";
const renderTemplate = (template, context) => template
    .replace(/\{badgeNumber\}/g, String(context.cardNumber ?? ""))
    .replace(/\{(\w+)\}/g, (_, key) => {
    const value = context[key];
    if (value === undefined || value === null) {
        return "";
    }
    return String(value);
});
const formatPortalKeyAsName = (portalKey) => portalKey
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || portalKey;
const resolveManualNotificationDefaults = async (portalKey) => {
    const portal = await prismaFlowly.onboardingPortalTemplate.findFirst({
        where: {
            portalKey,
            isDeleted: false,
        },
        orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
        select: {
            portalName: true,
            defaultDurationDay: true,
        },
    });
    return {
        portalKey,
        portalName: normalizeOptionalText(portal?.portalName) ?? formatPortalKeyAsName(portalKey),
        loginUrl: resolveOmsLoginUrl(),
        hrdUrl: resolveHrdDecisionUrl(),
        supportName: resolveSupportName(),
        supportPhone: resolveSupportPhone(),
        defaultDurationDay: portal?.defaultDurationDay ?? null,
    };
};
const parseConfiguredTestRecipientIds = () => Array.from(new Set((process.env.ONBOARDING_EXAM_MONITOR_USER_IDS ??
    process.env.ONBOARDING_EXAM_MONITOR_USER_ID ??
    "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)));
const formatDateTimeForNotification = (value) => value.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
const trimMessage = (value) => value.trim().slice(0, 1000);
const buildErrorMessage = (value) => {
    if (!value)
        return "Unknown error";
    if (value instanceof Error)
        return value.message;
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
};
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
const buildWhatsappTestMessage = (params) => trimMessage([
    "Tes notifikasi WA.",
    "",
    `Halo ${params.employeeName}, pesan ini dikirim untuk memastikan service WhatsApp aktif.`,
    `User ID: ${params.userId}`,
    `Waktu: ${params.sentAtText}`,
].join("\n"));
const toPortalScopeKey = (portalKeys) => portalKeys.length === 0 ? "__ALL_PORTALS__" : portalKeys.join("|");
const matchesPortalScope = (item, portalKeys) => {
    const itemPortalKeys = normalizePortalKeys((item.portalMappings ?? [])
        .filter((mapping) => !mapping.isDeleted)
        .map((mapping) => mapping.portalKey));
    return toPortalScopeKey(itemPortalKeys) === toPortalScopeKey(portalKeys);
};
const prismaNotificationTemplate = () => prismaFlowly;
const notificationTemplateInclude = {
    portalMappings: {
        where: { isDeleted: false },
        orderBy: { portalKey: "asc" },
    },
};
export class NotificationTemplateService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.CREATE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const channel = normalizeUpper(request.channel);
        const eventKey = normalizeUpper(request.eventKey);
        const recipientRole = normalizeUpper(request.recipientRole);
        const portalKeys = normalizePortalKeys(request.portalKeys);
        const now = new Date();
        const candidates = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                channel,
                eventKey,
                recipientRole,
            },
            include: notificationTemplateInclude,
        });
        const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
        if (conflict) {
            throw new ResponseError(409, "Template with the same channel, event, recipient role, and portal scope already exists");
        }
        const makeTemplateId = await generateNotificationTemplateId();
        const makePortalMappingId = await generateNotificationTemplatePortalId();
        const created = await client.$transaction(async (tx) => {
            const template = await tx.notificationTemplate.create({
                data: {
                    notificationTemplateId: makeTemplateId(),
                    templateName: request.templateName,
                    channel,
                    eventKey,
                    recipientRole,
                    messageTemplate: request.messageTemplate,
                    isActive: request.isActive ?? true,
                    isDeleted: false,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: requesterId,
                    updatedBy: requesterId,
                },
            });
            for (const portalKey of portalKeys) {
                await tx.notificationTemplatePortal.create({
                    data: {
                        notificationTemplatePortalId: makePortalMappingId(),
                        notificationTemplateId: template.notificationTemplateId,
                        portalKey,
                        isActive: true,
                        isDeleted: false,
                        createdAt: now,
                        updatedAt: now,
                        createdBy: requesterId,
                        updatedBy: requesterId,
                    },
                });
            }
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: template.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!created) {
            throw new ResponseError(500, "Failed to create notification template");
        }
        return toNotificationTemplateResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.UPDATE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const existing = await client.notificationTemplate.findUnique({
            where: { notificationTemplateId: request.notificationTemplateId },
            include: notificationTemplateInclude,
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const channel = request.channel !== undefined
            ? normalizeUpper(request.channel)
            : existing.channel;
        const eventKey = request.eventKey !== undefined
            ? normalizeUpper(request.eventKey)
            : existing.eventKey;
        const recipientRole = request.recipientRole !== undefined
            ? normalizeUpper(request.recipientRole)
            : existing.recipientRole;
        const portalKeys = request.portalKeys !== undefined
            ? normalizePortalKeys(request.portalKeys)
            : normalizePortalKeys((existing.portalMappings ?? []).map((mapping) => mapping.portalKey));
        const candidates = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                channel,
                eventKey,
                recipientRole,
                NOT: { notificationTemplateId: request.notificationTemplateId },
            },
            include: notificationTemplateInclude,
        });
        const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
        if (conflict) {
            throw new ResponseError(409, "Template with the same channel, event, recipient role, and portal scope already exists");
        }
        const now = new Date();
        const makePortalMappingId = await generateNotificationTemplatePortalId();
        const updated = await client.$transaction(async (tx) => {
            await tx.notificationTemplate.update({
                where: { notificationTemplateId: request.notificationTemplateId },
                data: {
                    templateName: request.templateName ?? existing.templateName,
                    channel,
                    eventKey,
                    recipientRole,
                    messageTemplate: request.messageTemplate ?? existing.messageTemplate,
                    isActive: request.isActive ?? existing.isActive,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            if (request.portalKeys !== undefined) {
                await tx.notificationTemplatePortal.updateMany({
                    where: {
                        notificationTemplateId: request.notificationTemplateId,
                        isDeleted: false,
                    },
                    data: {
                        isDeleted: true,
                        isActive: false,
                        deletedAt: now,
                        deletedBy: requesterId,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
                for (const portalKey of portalKeys) {
                    await tx.notificationTemplatePortal.create({
                        data: {
                            notificationTemplatePortalId: makePortalMappingId(),
                            notificationTemplateId: request.notificationTemplateId,
                            portalKey,
                            isActive: true,
                            isDeleted: false,
                            createdAt: now,
                            updatedAt: now,
                            createdBy: requesterId,
                            updatedBy: requesterId,
                        },
                    });
                }
            }
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: request.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!updated) {
            throw new ResponseError(500, "Failed to update notification template");
        }
        return toNotificationTemplateResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.DELETE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const existing = await client.notificationTemplate.findUnique({
            where: { notificationTemplateId: request.notificationTemplateId },
            include: notificationTemplateInclude,
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const now = new Date();
        const updated = await client.$transaction(async (tx) => {
            await tx.notificationTemplatePortal.updateMany({
                where: {
                    notificationTemplateId: request.notificationTemplateId,
                    isDeleted: false,
                },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            await tx.notificationTemplate.update({
                where: { notificationTemplateId: request.notificationTemplateId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: request.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!updated) {
            throw new ResponseError(500, "Failed to delete notification template");
        }
        return toNotificationTemplateResponse(updated);
    }
    static async listManualRecipients(requesterId, filters) {
        const request = Validation.validate(NotificationTemplateValidation.LIST_MANUAL_RECIPIENTS, filters);
        await ensureAdminAccess(requesterId);
        const portalKey = normalizeUpper(request.portalKey ?? DEFAULT_MANUAL_PORTAL_KEY);
        const search = normalizeOptionalText(request.search);
        const limit = request.limit ?? 100;
        const numericSearch = search ? Number(search) : NaN;
        const hasNumericSearch = Number.isInteger(numericSearch) && Number(numericSearch) > 0;
        const employees = await prismaEmployee.em_employee.findMany({
            where: search
                ? {
                    OR: [
                        { Name: { contains: search } },
                        { CardNo: { contains: search } },
                        { BadgeNum: { contains: search } },
                        ...(hasNumericSearch ? [{ UserId: Number(numericSearch) }] : []),
                    ],
                }
                : {},
            select: {
                UserId: true,
                Name: true,
                CardNo: true,
                BadgeNum: true,
                Phone: true,
                email: true,
                isFirstLogin: true,
            },
            orderBy: [{ Name: "asc" }, { UserId: "asc" }],
            take: limit,
        });
        const employeeIds = employees.map((employee) => employee.UserId);
        const assignments = employeeIds.length > 0
            ? await prismaFlowly.onboardingAssignment.findMany({
                where: {
                    portalKey,
                    participantReferenceType: EMPLOYEE_REFERENCE_TYPE,
                    participantReferenceId: {
                        in: employeeIds.map(String),
                    },
                    isDeleted: false,
                },
                orderBy: [
                    { participantReferenceId: "asc" },
                    { startedAt: "desc" },
                    { createdAt: "desc" },
                ],
                select: {
                    onboardingAssignmentId: true,
                    participantReferenceId: true,
                    status: true,
                    startedAt: true,
                    dueAt: true,
                },
            })
            : [];
        const latestAssignmentByEmployee = new Map();
        for (const assignment of assignments) {
            if (!latestAssignmentByEmployee.has(assignment.participantReferenceId)) {
                latestAssignmentByEmployee.set(assignment.participantReferenceId, assignment);
            }
        }
        const defaults = await resolveManualNotificationDefaults(portalKey);
        return {
            portalKey: defaults.portalKey,
            portalName: defaults.portalName,
            loginUrl: defaults.loginUrl,
            hrdUrl: defaults.hrdUrl,
            supportName: defaults.supportName,
            supportPhone: defaults.supportPhone,
            recipients: employees.map((employee) => {
                const assignment = latestAssignmentByEmployee.get(String(employee.UserId));
                return {
                    userId: employee.UserId,
                    employeeName: normalizeOptionalText(employee.Name),
                    cardNumber: normalizeOptionalText(employee.CardNo),
                    badgeNumber: normalizeOptionalText(employee.BadgeNum),
                    phoneNumber: normalizePhone(employee.Phone),
                    email: normalizeEmail(employee.email),
                    isFirstLogin: Number(employee.isFirstLogin ?? 0) !== 0,
                    latestAssignmentId: assignment?.onboardingAssignmentId ?? null,
                    latestAssignmentStatus: assignment?.status ?? null,
                    latestStartedAt: assignment?.startedAt ?? null,
                    latestDueAt: assignment?.dueAt ?? null,
                };
            }),
        };
    }
    static async sendManual(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.MANUAL_SEND, reqBody);
        await ensureAdminAccess(requesterId);
        const portalKey = normalizeUpper(request.portalKey);
        const client = prismaNotificationTemplate();
        const template = await client.notificationTemplate.findUnique({
            where: { notificationTemplateId: request.notificationTemplateId },
            include: notificationTemplateInclude,
        });
        if (!template || template.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        if (!template.isActive) {
            throw new ResponseError(400, "Template notifikasi sedang nonaktif");
        }
        const channel = normalizeUpper(template.channel);
        if (channel !== CHANNEL_WHATSAPP) {
            throw new ResponseError(400, "Kirim manual saat ini hanya mendukung template WhatsApp");
        }
        if (normalizeUpper(template.recipientRole) !== PARTICIPANT_RECIPIENT_ROLE) {
            throw new ResponseError(400, "Kirim manual ke karyawan hanya mendukung template peserta onboarding");
        }
        const scopedPortalKeys = normalizePortalKeys((template.portalMappings ?? []).map((mapping) => mapping.portalKey));
        if (scopedPortalKeys.length > 0 && !scopedPortalKeys.includes(portalKey)) {
            throw new ResponseError(400, "Template tidak berlaku untuk portal yang dipilih");
        }
        const messageTemplate = normalizeOptionalText(request.messageTemplate) ?? template.messageTemplate;
        const employees = await prismaEmployee.em_employee.findMany({
            where: {
                UserId: {
                    in: request.userIds,
                },
            },
            select: {
                UserId: true,
                Name: true,
                CardNo: true,
                BadgeNum: true,
                Phone: true,
                email: true,
                Password: true,
                isFirstLogin: true,
            },
        });
        const employeeMap = new Map(employees.map((employee) => [employee.UserId, employee]));
        const assignments = await prismaFlowly.onboardingAssignment.findMany({
            where: {
                portalKey,
                participantReferenceType: EMPLOYEE_REFERENCE_TYPE,
                participantReferenceId: {
                    in: request.userIds.map(String),
                },
                isDeleted: false,
            },
            orderBy: [
                { participantReferenceId: "asc" },
                { startedAt: "desc" },
                { createdAt: "desc" },
            ],
            select: {
                onboardingAssignmentId: true,
                participantReferenceId: true,
                status: true,
                startedAt: true,
                durationDay: true,
                dueAt: true,
            },
        });
        const latestAssignmentByEmployee = new Map();
        for (const assignment of assignments) {
            if (!latestAssignmentByEmployee.has(assignment.participantReferenceId)) {
                latestAssignmentByEmployee.set(assignment.participantReferenceId, assignment);
            }
        }
        const defaults = await resolveManualNotificationDefaults(portalKey);
        const createNotificationOutboxId = await generateNotificationOutboxId();
        const now = new Date();
        const outboxes = [];
        const results = [];
        for (const userId of request.userIds) {
            const employee = employeeMap.get(userId);
            if (!employee) {
                results.push({
                    userId,
                    employeeName: null,
                    phoneNumber: null,
                    email: null,
                    notificationOutboxId: null,
                    status: "SKIPPED",
                    error: "Employee not found",
                });
                continue;
            }
            const phoneNumber = normalizePhone(employee.Phone);
            const email = normalizeEmail(employee.email);
            const employeeName = normalizeOptionalText(employee.Name) ?? `Employee ${employee.UserId}`;
            const cardNumber = normalizeOptionalText(employee.CardNo) ??
                normalizeOptionalText(employee.BadgeNum) ??
                String(employee.UserId);
            const assignment = latestAssignmentByEmployee.get(String(employee.UserId));
            if (!phoneNumber) {
                results.push({
                    userId: employee.UserId,
                    employeeName,
                    phoneNumber: null,
                    email,
                    notificationOutboxId: null,
                    status: "SKIPPED",
                    error: "Missing phone number",
                });
                continue;
            }
            const context = {
                recipientName: employeeName,
                employeeName,
                participantName: employeeName,
                portalName: defaults.portalName,
                portalKey,
                cardNumber,
                username: cardNumber,
                temporaryPassword: resolveTemporaryPassword(employee.Password),
                deadlineDays: assignment?.durationDay ?? defaults.defaultDurationDay ?? "",
                dueDate: formatOptionalDateForNotification(assignment?.dueAt),
                startedDate: assignment?.startedAt
                    ? formatDateForNotification(assignment.startedAt)
                    : "",
                status: assignment?.status ?? "",
                previousDueDate: "",
                extensionDays: "",
                decisionNote: "",
                decisionAt: "",
                decisionLabel: "",
                decisionType: "",
                decisionActorName: "",
                decisionActorBadge: "",
                decisionUrl: defaults.hrdUrl,
                nextDurationDay: "",
                failedAt: "",
                sbuSubName: "",
                sbuName: "",
                pilarName: "",
                positionName: "",
                jabatanName: "",
                hrdUrl: defaults.hrdUrl,
                loginUrl: defaults.loginUrl,
                supportName: defaults.supportName,
                supportPhone: defaults.supportPhone,
                stageName: "",
                examsId: "",
                occurredAt: formatDateTimeForNotification(now),
                eventLabel: template.eventKey,
                examAction: "",
            };
            const notificationOutboxId = createNotificationOutboxId();
            const meta = JSON.stringify({
                channel,
                manual: true,
                source: MANUAL_SOURCE,
                requestedBy: requesterId,
                recipientUserId: employee.UserId,
                recipientName: employeeName,
                email,
                phoneNumber,
                portalName: defaults.portalName,
                cardNumber,
                username: cardNumber,
                dueDate: context.dueDate,
                startedDate: context.startedDate,
                loginUrl: defaults.loginUrl,
                hrdUrl: defaults.hrdUrl,
                messageTemplateEdited: messageTemplate !== template.messageTemplate,
            });
            outboxes.push({
                notificationOutboxId,
                notificationTemplateId: template.notificationTemplateId,
                portalKey,
                eventKey: template.eventKey,
                recipientRole: template.recipientRole,
                recipientReferenceType: EMPLOYEE_REFERENCE_TYPE,
                recipientReferenceId: String(employee.UserId),
                contextReferenceType: MANUAL_CONTEXT_REFERENCE_TYPE,
                contextReferenceId: `${employee.UserId}:${now.getTime()}`,
                phoneNumber,
                message: trimMessage(renderTemplate(messageTemplate, context)),
                status: "PENDING",
                attempts: 0,
                lastError: null,
                provider: null,
                sentAt: null,
                meta,
                isActive: true,
                isDeleted: false,
                createdAt: now,
                createdBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
                deletedAt: null,
                deletedBy: null,
            });
            results.push({
                userId: employee.UserId,
                employeeName,
                phoneNumber,
                email,
                notificationOutboxId,
                status: "QUEUED",
                error: null,
            });
        }
        if (outboxes.length > 0) {
            await prismaFlowly.notificationOutbox.createMany({
                data: outboxes,
            });
        }
        return {
            queued: results.filter((item) => item.status === "QUEUED").length,
            skipped: results.filter((item) => item.status === "SKIPPED").length,
            recipients: results,
        };
    }
    static async sendWhatsappTest(requesterId) {
        await ensureAdminAccess(requesterId);
        const configuredUserIds = parseConfiguredTestRecipientIds();
        if (configuredUserIds.length === 0) {
            throw new ResponseError(400, "ONBOARDING_EXAM_MONITOR_USER_IDS belum diset");
        }
        const employees = await prismaEmployee.em_employee.findMany({
            where: {
                UserId: {
                    in: configuredUserIds,
                },
            },
            select: {
                UserId: true,
                CardNo: true,
                BadgeNum: true,
                Name: true,
                Phone: true,
            },
        });
        const employeeMap = new Map(employees.map((employee) => [employee.UserId, employee]));
        const createNotificationOutboxId = await generateNotificationOutboxId();
        const sentAt = new Date();
        const sentAtText = formatDateTimeForNotification(sentAt);
        const results = [];
        for (const userId of configuredUserIds) {
            const employee = employeeMap.get(userId);
            if (!employee) {
                results.push({
                    userId,
                    employeeName: null,
                    phoneNumber: null,
                    notificationOutboxId: null,
                    status: "SKIPPED",
                    error: "Employee not found",
                });
                continue;
            }
            const phoneNumber = normalizePhone(employee.Phone);
            const employeeName = normalizeOptionalText(employee.Name) ?? `Employee ${employee.UserId}`;
            const cardNumber = normalizeOptionalText(employee.CardNo) ??
                normalizeOptionalText(employee.BadgeNum) ??
                String(employee.UserId);
            if (!phoneNumber) {
                results.push({
                    userId,
                    employeeName,
                    phoneNumber: null,
                    notificationOutboxId: null,
                    status: "SKIPPED",
                    error: "Missing phone number",
                });
                continue;
            }
            const message = buildWhatsappTestMessage({
                employeeName,
                userId: employee.UserId,
                sentAtText,
            });
            const notificationOutboxId = createNotificationOutboxId();
            const meta = JSON.stringify({
                channel: CHANNEL_WHATSAPP,
                test: true,
                source: "ADMIN_WHATSAPP_SERVICE_TEST",
                requestedBy: requesterId,
                recipientUserId: employee.UserId,
                recipientName: employeeName,
                cardNumber,
                sentAt: sentAt.toISOString(),
            });
            await prismaFlowly.notificationOutbox.create({
                data: {
                    notificationOutboxId,
                    notificationTemplateId: null,
                    portalKey: TEST_PORTAL_KEY,
                    eventKey: TEST_EVENT_KEY,
                    recipientRole: TEST_RECIPIENT_ROLE,
                    recipientReferenceType: EMPLOYEE_REFERENCE_TYPE,
                    recipientReferenceId: String(employee.UserId),
                    contextReferenceType: TEST_CONTEXT_REFERENCE_TYPE,
                    contextReferenceId: `${requesterId}:${employee.UserId}:${sentAt.getTime()}`,
                    phoneNumber,
                    message,
                    status: "PROCESSING",
                    attempts: 0,
                    lastError: null,
                    provider: null,
                    sentAt: null,
                    meta,
                    isActive: true,
                    isDeleted: false,
                    createdAt: sentAt,
                    createdBy: requesterId,
                    updatedAt: sentAt,
                    updatedBy: requesterId,
                    deletedAt: null,
                    deletedBy: null,
                },
            });
            try {
                await dispatchGenericNotificationOutboxItem({
                    notificationOutboxId,
                    phoneNumber,
                    message,
                    attempts: 0,
                    meta,
                    template: {
                        channel: CHANNEL_WHATSAPP,
                    },
                });
            }
            catch (error) {
                await prismaFlowly.notificationOutbox.update({
                    where: { notificationOutboxId },
                    data: {
                        attempts: 1,
                        status: "FAILED",
                        lastError: buildErrorMessage(error).slice(0, 500),
                        provider: "WHAPI",
                        sentAt: null,
                        updatedAt: new Date(),
                        updatedBy: "SYSTEM",
                    },
                });
            }
            const outbox = await prismaFlowly.notificationOutbox.findUnique({
                where: { notificationOutboxId },
                select: {
                    status: true,
                    lastError: true,
                },
            });
            results.push({
                userId,
                employeeName,
                phoneNumber,
                notificationOutboxId,
                status: outbox?.status === "PENDING" && outbox.lastError
                    ? "FAILED"
                    : outbox?.status ?? "PENDING",
                error: outbox?.lastError ?? null,
            });
        }
        return {
            configuredUserIds,
            sent: results.filter((item) => item.status === "SENT").length,
            pending: results.filter((item) => item.status === "PENDING").length,
            failed: results.filter((item) => item.status === "FAILED").length,
            skipped: results.filter((item) => item.status === "SKIPPED").length,
            recipients: results,
        };
    }
    static async list(requesterId, filters) {
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const items = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                ...(filters?.channel
                    ? { channel: normalizeUpper(filters.channel) }
                    : {}),
                ...(filters?.eventKey
                    ? { eventKey: normalizeUpper(filters.eventKey) }
                    : {}),
                ...(filters?.recipientRole
                    ? { recipientRole: normalizeUpper(filters.recipientRole) }
                    : {}),
                ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
                ...(filters?.portalKey
                    ? {
                        portalMappings: {
                            some: {
                                portalKey: normalizeUpper(filters.portalKey),
                                isDeleted: false,
                            },
                        },
                    }
                    : {}),
            },
            include: notificationTemplateInclude,
            orderBy: { updatedAt: "desc" },
        });
        return items.map(toNotificationTemplateListResponse);
    }
}
//# sourceMappingURL=notification-template-service.js.map