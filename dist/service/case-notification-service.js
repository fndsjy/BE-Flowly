import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { generateCaseNotificationId } from "../utils/id-generator.js";
const notificationClient = prismaFlowly;
const normalizePhone = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D+/g, "");
    return digits.length > 0 ? digits : null;
};
export class CaseNotificationService {
    static async enqueuePicNotifications(params) {
        const sbuSubIds = Array.from(params.departmentMap.keys());
        if (sbuSubIds.length === 0)
            return;
        const sbuSubs = await prismaEmployee.em_sbu_sub.findMany({
            where: {
                id: { in: sbuSubIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true, sbu_sub_name: true, pic: true },
        });
        const picIds = Array.from(new Set(sbuSubs.map((item) => item.pic).filter((id) => !!id)));
        if (picIds.length === 0)
            return;
        const pics = await prismaEmployee.em_employee.findMany({
            where: { UserId: { in: picIds } },
            select: { UserId: true, Phone: true },
        });
        const picMap = new Map(pics.map((pic) => [pic.UserId, pic]));
        const createId = await generateCaseNotificationId();
        const now = new Date();
        const payloads = sbuSubs
            .map((sbuSub) => {
            if (!sbuSub.pic)
                return null;
            const pic = picMap.get(sbuSub.pic);
            const phone = normalizePhone(pic?.Phone ?? null);
            if (!phone)
                return null;
            return {
                caseNotificationId: createId(),
                caseId: params.caseId,
                caseDepartmentId: params.departmentMap.get(sbuSub.id) ?? null,
                recipientEmployeeId: sbuSub.pic,
                channel: "WHATSAPP",
                phoneNumber: phone,
                message: "",
                status: "PENDING",
                attempts: 0,
                provider: "SYSTEM",
                meta: JSON.stringify({
                    sbuSubId: sbuSub.id,
                    sbuSubName: sbuSub.sbu_sub_name,
                    role: "PIC",
                    action: "NEW_CASE",
                }),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: params.requesterId,
                updatedBy: params.requesterId,
            };
        })
            .filter((item) => item !== null);
        if (payloads.length > 0) {
            await notificationClient.caseNotificationOutbox.createMany({
                data: payloads,
            });
        }
    }
    static async enqueueAssigneeNotification(params) {
        const [caseHeader, sbuSub, employee] = await Promise.all([
            prismaFlowly.caseHeader.findUnique({
                where: { caseId: params.caseId },
                select: { caseTitle: true, caseType: true, isDeleted: true },
            }),
            prismaEmployee.em_sbu_sub.findFirst({
                where: {
                    id: params.sbuSubId,
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { sbu_sub_name: true },
            }),
            prismaEmployee.em_employee.findUnique({
                where: { UserId: params.assigneeEmployeeId },
                select: { Phone: true },
            }),
        ]);
        if (!caseHeader || caseHeader.isDeleted)
            return;
        if (!sbuSub)
            return;
        const phone = normalizePhone(employee?.Phone ?? null);
        if (!phone)
            return;
        const createId = await generateCaseNotificationId();
        const now = new Date();
        await notificationClient.caseNotificationOutbox.create({
            data: {
                caseNotificationId: createId(),
                caseId: params.caseId,
                caseDepartmentId: params.caseDepartmentId,
                recipientEmployeeId: params.assigneeEmployeeId,
                channel: "WHATSAPP",
                phoneNumber: phone,
                message: "",
                status: "PENDING",
                attempts: 0,
                provider: "SYSTEM",
                meta: JSON.stringify({
                    sbuSubId: params.sbuSubId,
                    sbuSubName: sbuSub.sbu_sub_name,
                    role: "ASSIGNEE",
                    action: "ASSIGN_TASK",
                }),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: params.requesterId,
                updatedBy: params.requesterId,
            },
        });
    }
    static async enqueueDepartmentAddedNotification(params) {
        const [caseHeader, sbuSub] = await Promise.all([
            prismaFlowly.caseHeader.findUnique({
                where: { caseId: params.caseId },
                select: { caseTitle: true, caseType: true, isDeleted: true },
            }),
            prismaEmployee.em_sbu_sub.findFirst({
                where: {
                    id: params.sbuSubId,
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { sbu_sub_name: true, pic: true },
            }),
        ]);
        if (!caseHeader || caseHeader.isDeleted)
            return;
        if (!sbuSub?.pic)
            return;
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: sbuSub.pic },
            select: { Phone: true },
        });
        const phone = normalizePhone(employee?.Phone ?? null);
        if (!phone)
            return;
        const createId = await generateCaseNotificationId();
        const now = new Date();
        await notificationClient.caseNotificationOutbox.create({
            data: {
                caseNotificationId: createId(),
                caseId: params.caseId,
                caseDepartmentId: params.caseDepartmentId,
                recipientEmployeeId: sbuSub.pic,
                channel: "WHATSAPP",
                phoneNumber: phone,
                message: "",
                status: "PENDING",
                attempts: 0,
                provider: "SYSTEM",
                meta: JSON.stringify({
                    sbuSubId: params.sbuSubId,
                    sbuSubName: sbuSub.sbu_sub_name,
                    role: "PIC",
                    action: "ADD_DEPARTMENT",
                }),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: params.requesterId,
                updatedBy: params.requesterId,
            },
        });
    }
    static async enqueueRequesterDecisionNotification(params) {
        const caseHeader = await prismaFlowly.caseHeader.findUnique({
            where: { caseId: params.caseId },
            select: { requesterId: true, requesterEmployeeId: true, isDeleted: true },
        });
        if (!caseHeader || caseHeader.isDeleted)
            return;
        let recipientEmployeeId = caseHeader.requesterEmployeeId ?? null;
        if (!recipientEmployeeId && caseHeader.requesterId) {
            const numericId = Number(caseHeader.requesterId);
            if (Number.isFinite(numericId)) {
                recipientEmployeeId = numericId;
            }
        }
        if (!recipientEmployeeId)
            return;
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: recipientEmployeeId },
            select: { Phone: true },
        });
        const phone = normalizePhone(employee?.Phone ?? null);
        if (!phone)
            return;
        const createId = await generateCaseNotificationId();
        const now = new Date();
        await notificationClient.caseNotificationOutbox.create({
            data: {
                caseNotificationId: createId(),
                caseId: params.caseId,
                caseDepartmentId: params.caseDepartmentId,
                recipientEmployeeId,
                channel: "WHATSAPP",
                phoneNumber: phone,
                message: "",
                status: "PENDING",
                attempts: 0,
                provider: "SYSTEM",
                meta: JSON.stringify({
                    role: "REQUESTER",
                    action: "DECISION",
                }),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: params.requesterId,
                updatedBy: params.requesterId,
            },
        });
    }
    static async enqueueFeedbackCommentNotifications(params) {
        const caseHeader = await prismaFlowly.caseHeader.findUnique({
            where: { caseId: params.caseId },
            select: {
                caseId: true,
                isDeleted: true,
                requesterId: true,
                requesterEmployeeId: true,
                originSbuSubId: true,
            },
        });
        if (!caseHeader || caseHeader.isDeleted)
            return;
        const resolveRequesterEmployeeId = async () => {
            if (caseHeader.requesterEmployeeId)
                return caseHeader.requesterEmployeeId;
            const requesterId = caseHeader.requesterId ?? params.requesterId;
            if (!requesterId)
                return null;
            const numericId = Number(requesterId);
            if (!Number.isNaN(numericId)) {
                const employee = await prismaEmployee.em_employee.findUnique({
                    where: { UserId: numericId },
                    select: { UserId: true },
                });
                if (employee?.UserId)
                    return employee.UserId;
            }
            const user = await prismaFlowly.user.findUnique({
                where: { userId: requesterId, isDeleted: false },
                select: { badgeNumber: true },
            });
            const badgeNumber = user?.badgeNumber?.trim();
            if (!badgeNumber)
                return null;
            const employee = await prismaEmployee.em_employee.findFirst({
                where: { BadgeNum: badgeNumber },
                select: { UserId: true },
            });
            return employee?.UserId ?? null;
        };
        const departments = await prismaFlowly.caseDepartment.findMany({
            where: { caseId: params.caseId, isDeleted: false },
            select: {
                caseDepartmentId: true,
                sbuSubId: true,
                assigneeEmployeeId: true,
            },
        });
        if (departments.length === 0)
            return;
        const sbuSubIds = Array.from(new Set(departments.map((dept) => dept.sbuSubId)));
        const sbuSubs = await prismaEmployee.em_sbu_sub.findMany({
            where: {
                id: { in: sbuSubIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true, sbu_sub_name: true, sbu_sub_code: true, pic: true },
        });
        const sbuSubMap = new Map(sbuSubs.map((item) => [item.id, item]));
        let requesterSbuSubName = "";
        let requesterSbuSubCode = "";
        if (caseHeader.originSbuSubId) {
            const originSub = sbuSubMap.get(caseHeader.originSbuSubId);
            if (originSub) {
                requesterSbuSubName = originSub.sbu_sub_name;
                requesterSbuSubCode = originSub.sbu_sub_code ?? "";
            }
            else {
                const originLookup = await prismaEmployee.em_sbu_sub.findFirst({
                    where: {
                        id: caseHeader.originSbuSubId,
                        status: "A",
                        OR: [{ isDeleted: false }, { isDeleted: null }],
                    },
                    select: { sbu_sub_name: true, sbu_sub_code: true },
                });
                if (originLookup) {
                    requesterSbuSubName = originLookup.sbu_sub_name;
                    requesterSbuSubCode = originLookup.sbu_sub_code ?? "";
                }
            }
        }
        const recipients = [];
        const recipientKeys = new Set();
        const addRecipient = (dept, employeeId, role, override) => {
            if (!employeeId)
                return;
            if (params.commenterEmployeeId && params.commenterEmployeeId === employeeId) {
                return;
            }
            const key = String(employeeId);
            if (recipientKeys.has(key))
                return;
            const sbuSub = sbuSubMap.get(dept.sbuSubId);
            if (!sbuSub && !override)
                return;
            recipientKeys.add(key);
            recipients.push({
                caseDepartmentId: override?.caseDepartmentId ?? dept.caseDepartmentId,
                sbuSubId: dept.sbuSubId,
                sbuSubName: override?.sbuSubName ?? sbuSub?.sbu_sub_name ?? "",
                sbuSubCode: override?.sbuSubCode ?? sbuSub?.sbu_sub_code ?? "",
                recipientEmployeeId: employeeId,
                role,
            });
        };
        for (const dept of departments) {
            addRecipient(dept, dept.assigneeEmployeeId, "ASSIGNEE");
            const sbuSub = sbuSubMap.get(dept.sbuSubId);
            addRecipient(dept, sbuSub?.pic, "PIC");
        }
        const requesterEmployeeId = await resolveRequesterEmployeeId();
        if (requesterEmployeeId) {
            const fallbackDept = departments[0];
            if (!fallbackDept)
                return;
            const requesterDept = {
                caseDepartmentId: null,
                sbuSubId: caseHeader.originSbuSubId ?? fallbackDept.sbuSubId,
            };
            addRecipient(requesterDept, requesterEmployeeId, "REQUESTER", {
                sbuSubName: requesterSbuSubName,
                sbuSubCode: requesterSbuSubCode,
                caseDepartmentId: null,
            });
        }
        if (recipients.length === 0)
            return;
        const recipientIds = Array.from(new Set(recipients.map((item) => item.recipientEmployeeId)));
        const employees = await prismaEmployee.em_employee.findMany({
            where: { UserId: { in: recipientIds } },
            select: { UserId: true, Phone: true },
        });
        const employeeMap = new Map(employees.map((item) => [item.UserId, item]));
        const createId = await generateCaseNotificationId();
        const now = new Date();
        const payloads = recipients
            .map((recipient) => {
            const employee = employeeMap.get(recipient.recipientEmployeeId);
            const phone = normalizePhone(employee?.Phone ?? null);
            if (!phone)
                return null;
            return {
                caseNotificationId: createId(),
                caseId: params.caseId,
                caseDepartmentId: recipient.caseDepartmentId ?? null,
                recipientEmployeeId: recipient.recipientEmployeeId,
                channel: "WHATSAPP",
                phoneNumber: phone,
                message: "",
                status: "PENDING",
                attempts: 0,
                provider: "SYSTEM",
                meta: JSON.stringify({
                    sbuSubId: recipient.sbuSubId,
                    sbuSubName: recipient.sbuSubName,
                    sbuSubCode: recipient.sbuSubCode,
                    role: recipient.role,
                    action: "FEEDBACK_COMMENT",
                    commenterName: params.commenterName ?? "",
                    commentText: params.commentText ?? "",
                }),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: params.requesterId,
                updatedBy: params.requesterId,
            };
        })
            .filter((item) => item !== null);
        if (payloads.length > 0) {
            await notificationClient.caseNotificationOutbox.createMany({
                data: payloads,
            });
        }
    }
}
//# sourceMappingURL=case-notification-service.js.map