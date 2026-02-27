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
}
//# sourceMappingURL=case-notification-service.js.map