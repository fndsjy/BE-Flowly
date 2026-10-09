import { isDefiniteNoSendFailure } from "./notification-delivery.js";
import { randomBytes } from "node:crypto";
import { prismaFlowly } from "../application/database.js";
import { getAccessContext } from "../utils/access-scope.js";
import { ResponseError } from "../error/response-error.js";
import { dispatchGenericNotificationOutboxItem } from "./generic-notification-dispatcher.js";
const metaOf = (value) => { try {
    return JSON.parse(value ?? "{}");
}
catch {
    return {};
} };
export const manualNotificationStartAt = new Date("2026-10-09T00:00:00+07:00");
export const retryBlockReason = (row) => {
    const meta = metaOf(row.meta);
    if (row.status !== "FAILED")
        return "Pesan tidak berstatus gagal.";
    if (!isDefiniteNoSendFailure(row.lastError))
        return "Periksa riwayat gateway terlebih dahulu; pengiriman belum dipastikan gagal sebelum pesan dikirim.";
    if (meta.manualRetryId)
        return "Percobaan kirim ulang sudah dibuat.";
    if (meta.expiresAt && (!Number.isFinite(Date.parse(String(meta.expiresAt))) || Date.parse(String(meta.expiresAt)) <= Date.now()))
        return "Password sudah kedaluwarsa. Karyawan perlu meminta password baru.";
    return null;
};
export class FailedNotificationService {
    static async authorize(userId) {
        if (!(await getAccessContext(userId)).isAdmin)
            throw new ResponseError(403, "Admin access required");
    }
    static async list(userId) {
        await this.authorize(userId);
        const rows = await prismaFlowly.notificationOutbox.findMany({ where: { createdAt: { gte: manualNotificationStartAt }, status: "FAILED", isDeleted: false, isActive: true, OR: [{ meta: { contains: '"channel":"WHATSAPP"' } }, { template: { channel: "WHATSAPP" } }] }, orderBy: { updatedAt: "desc" }, take: 100,
            select: { notificationOutboxId: true, phoneNumber: true, eventKey: true, createdAt: true, updatedAt: true, status: true, lastError: true, meta: true, template: { select: { channel: true } } } });
        return rows.map(row => ({ notificationOutboxId: row.notificationOutboxId, phoneNumber: row.phoneNumber,
            eventKey: row.eventKey, createdAt: row.createdAt, lastError: row.lastError,
            blockedReason: retryBlockReason(row) }));
    }
    static async retry(userId, id) {
        await this.authorize(userId);
        const original = await prismaFlowly.notificationOutbox.findUnique({ where: { notificationOutboxId: id } });
        if (!original || original.isDeleted || !original.isActive)
            throw new ResponseError(404, "Pesan tidak ditemukan");
        const stageId = String(metaOf(original.meta).stageProgressId ?? "");
        const item = await prismaFlowly.$transaction(async (tx) => {
            const resource = stageId ? "exam-password-stage:" + stageId : "manual-notification:" + id;
            const lock = await tx.$queryRaw `
        DECLARE @result int;
        EXEC @result = sys.sp_getapplock @Resource = ${resource}, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 10000;
        SELECT @result AS result;
      `;
            if (!lock[0] || lock[0].result < 0)
                throw new ResponseError(409, "Pengiriman sedang diproses");
            const row = await tx.notificationOutbox.findUnique({ where: { notificationOutboxId: id }, include: { template: { select: { channel: true } } } });
            if (!row || row.isDeleted || !row.isActive)
                throw new ResponseError(404, "Pesan tidak ditemukan");
            if (row.createdAt < manualNotificationStartAt)
                throw new ResponseError(409, "Kirim ulang hanya tersedia untuk pesan mulai 9 Oktober 2026 (WIB).");
            const blocked = retryBlockReason(row);
            if (blocked)
                throw new ResponseError(409, blocked);
            if (String(row.template?.channel ?? metaOf(row.meta).channel).toUpperCase() !== "WHATSAPP")
                throw new ResponseError(400, "Hanya pengiriman WhatsApp yang didukung");
            if (row.contextReferenceType === "ONBOARDING_EXAM_START_APPROVAL") {
                const approvals = await tx.$queryRaw `
          SELECT [status], [expiresAt] FROM [dbo].[onboarding_exam_start_approval]
          WHERE [onboardingExamStartApprovalId] = ${row.contextReferenceId}
            AND [isDeleted] = 0 AND [isActive] = 1
        `;
                if (!approvals[0] || approvals[0].status !== "PENDING" || approvals[0].expiresAt.getTime() <= Date.now())
                    throw new ResponseError(409, "Password sudah tidak berlaku. Karyawan perlu meminta password baru.");
            }
            const newId = "NMR" + randomBytes(8).toString("hex");
            const now = new Date();
            await tx.notificationOutbox.update({ where: { notificationOutboxId: id }, data: {
                    meta: JSON.stringify({ ...metaOf(row.meta), manualRetryId: newId }), updatedBy: userId,
                } });
            return tx.notificationOutbox.create({ data: {
                    notificationOutboxId: newId, notificationTemplateId: row.notificationTemplateId,
                    portalKey: row.portalKey, eventKey: row.eventKey, recipientRole: row.recipientRole,
                    recipientReferenceType: row.recipientReferenceType, recipientReferenceId: row.recipientReferenceId,
                    contextReferenceType: row.contextReferenceType, contextReferenceId: row.contextReferenceId,
                    phoneNumber: row.phoneNumber, message: row.message, status: "PROCESSING", attempts: 0,
                    lastError: "DELIVERY_PREPARING", meta: JSON.stringify({ ...metaOf(row.meta), channel: "WHATSAPP", manualRetryId: undefined, manualRetryOf: id }),
                    createdAt: now, createdBy: userId, updatedAt: now, updatedBy: userId,
                } });
        }, { maxWait: 15000, timeout: 30000 });
        try {
            await dispatchGenericNotificationOutboxItem(item);
        }
        catch (error) {
            await prismaFlowly.notificationOutbox.update({ where: { notificationOutboxId: item.notificationOutboxId }, data: {
                    status: "FAILED", attempts: 1, lastError: ((error instanceof Error ? error.message : String(error)).startsWith("DELIVERY_UNCERTAIN:") ? (error instanceof Error ? error.message : String(error)) : "DELIVERY_NOT_SENT: " + (error instanceof Error ? error.message : String(error))).slice(0, 500), updatedBy: userId,
                } });
        }
        const result = await prismaFlowly.notificationOutbox.findUnique({ where: { notificationOutboxId: item.notificationOutboxId }, select: { notificationOutboxId: true, status: true, lastError: true } });
        return result;
    }
}
//# sourceMappingURL=failed-notification-service.js.map