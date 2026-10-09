import { isRecordedServiceOff } from "./notification-delivery.js";
import { createHash } from "node:crypto";
import { prismaFlowly } from "../application/database.js";
import type { Prisma } from "../generated/flowly/client.js";

const metaOf = (value?: string | null): Record<string, unknown> => {
  try { return JSON.parse(value || "{}") ?? {}; } catch { return {}; }
};
const upper = (value?: string | null) => (value ?? "").trim().toUpperCase();
export const notificationPhone = (value: string) => {
  const digits = value.replace(/@(c\.us|s\.whatsapp\.net)$/i, "").replace(/\D/g, "");
  return digits.startsWith("00") ? digits.slice(2) : digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
};
type GenericItem = Pick<Prisma.NotificationOutboxCreateManyInput,
  "portalKey" | "eventKey" | "contextReferenceType" | "contextReferenceId" |
  "recipientRole" | "phoneNumber" | "message" | "meta"> & { template?: { channel: string } | null };

const isManual = (item: GenericItem) => ["ADMIN_MANUAL_NOTIFICATION", "WHATSAPP_SERVICE_TEST"].includes(upper(item.contextReferenceType));
const manualBatch = (item: GenericItem) => item.contextReferenceId?.split(":").at(-1) ?? "";

const genericScope = (item: GenericItem) => {
  const meta = metaOf(item.meta);
  if (isManual(item)) return JSON.stringify([upper(item.portalKey), upper(item.eventKey),
    upper(item.contextReferenceType), meta.requestedBy, manualBatch(item)]);
  // Automatic completion and HRD override refer to the same assignment.
  const assignment = upper(item.eventKey) === "ONBOARDING_PASSED"
    ? meta.onboardingAssignmentId ?? (upper(item.contextReferenceType) === "ONBOARDING_ASSIGNMENT" ? item.contextReferenceId : null)
    : null;
  return JSON.stringify([upper(item.portalKey), upper(item.eventKey),
    assignment ? "ONBOARDING_ASSIGNMENT" : upper(item.contextReferenceType),
    assignment ?? item.contextReferenceId ?? null]);
};
export const sameGenericNotification = (left: GenericItem, right: GenericItem) =>
  Boolean(left.contextReferenceId && right.contextReferenceId) &&
  upper(left.template?.channel ?? String(metaOf(left.meta).channel ?? "")) === "WHATSAPP" &&
  upper(right.template?.channel ?? String(metaOf(right.meta).channel ?? "")) === "WHATSAPP" &&
  genericScope(left) === genericScope(right) &&
  notificationPhone(left.phoneNumber) === notificationPhone(right.phoneNumber) &&
  (upper(left.recipientRole) === upper(right.recipientRole) ||
    left.message.replace(/\r\n/g, "\n").trim() === right.message.replace(/\r\n/g, "\n").trim());

// Transaction-owned SQL Server locks coordinate all application instances.
// The transaction ends BEFORE the HTTP request; attempts is the durable reservation.
const lockScope = async (tx: Prisma.TransactionClient, scope: string) => {
  const resource = `wa-outbox:${createHash("sha256").update(scope).digest("hex")}`;
  const result = await tx.$queryRaw<Array<{ result: number }>>`
    DECLARE @result int;
    EXEC @result = sys.sp_getapplock @Resource = ${resource},
      @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 10000;
    SELECT @result AS result;
  `;
  if (!result[0] || result[0].result < 0) throw new Error("Notification deduplication lock unavailable");
};
const genericCandidates = (tx: Prisma.TransactionClient, item: GenericItem) =>
  tx.notificationOutbox.findMany({ where: {
    portalKey: item.portalKey, eventKey: item.eventKey,
    // PASSED may have assignment or decision as its original context.
    ...(isManual(item) ? { contextReferenceType: item.contextReferenceType ?? null,
      contextReferenceId: { endsWith: `:${manualBatch(item)}` } }
    : upper(item.eventKey) === "ONBOARDING_PASSED" ? { OR: [
      { contextReferenceId: item.contextReferenceId ?? null },
      { meta: { contains: `"onboardingAssignmentId":"${metaOf(item.meta).onboardingAssignmentId ?? item.contextReferenceId}"` } },
    ] } : { contextReferenceType: item.contextReferenceType ?? null, contextReferenceId: item.contextReferenceId ?? null }),
  }, include: { template: { select: { channel: true } } } });

export const enqueueUniqueNotifications = async (args: { data: Prisma.NotificationOutboxCreateManyInput[] }) => {
  if (!args.data.length) return { count: 0, notificationOutboxIds: [] as string[] };
  return prismaFlowly.$transaction(async (tx) => {
    for (const scope of [...new Set(args.data.map(genericScope))].sort()) await lockScope(tx, scope);
    let count = 0;
    const notificationOutboxIds: string[] = [];
    for (const item of args.data) {
      const existing = await genericCandidates(tx, item);
      const duplicate = existing.find((other) => (!other.isDeleted || hasReservedDelivery(other)) && sameGenericNotification(item, other));
      if (duplicate) {
        notificationOutboxIds.push(duplicate.notificationOutboxId);
        continue;
      }
      await tx.notificationOutbox.create({ data: item });
      notificationOutboxIds.push(item.notificationOutboxId);
      count++;
    }
    return { count, notificationOutboxIds };
  }, { maxWait: 15000, timeout: 30000 });
};

const hasReservedDelivery = (item: { status: string; attempts: number; lastError: string | null }) =>
  item.status === "SENT" || (!(item.status === "FAILED" && isRecordedServiceOff(item.lastError)) && item.attempts > 0 &&
    ((item.status === "PROCESSING" && item.lastError !== "DELIVERY_PREPARING") || item.lastError?.startsWith("DELIVERY_UNCERTAIN:")));

export const claimGenericDelivery = async (id: string, attempts: number, phone: string) =>
  prismaFlowly.$transaction(async (tx) => {
    const item = await tx.notificationOutbox.findUnique({ where: { notificationOutboxId: id }, include: { template: { select: { channel: true } } } });
    if (!item || attempts !== 0) return false;
    if (item.contextReferenceType === "ONBOARDING_EXAM_START_APPROVAL") {
      const stageId = String(metaOf(item.meta).stageProgressId ?? "");
      if (!stageId) throw new Error("Missing exam approval stage");
      const resource = "exam-password-stage:" + stageId;
      const lock = await tx.$queryRaw<Array<{ result: number }>>`
        DECLARE @result int;
        EXEC @result = sys.sp_getapplock @Resource = ${resource}, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 10000;
        SELECT @result AS result;
      `;
      if (!lock[0] || lock[0].result < 0) throw new Error("Exam approval lock unavailable");
      const approvals = await tx.$queryRaw<Array<{ status: string; expiresAt: Date }>>`
        SELECT [status], [expiresAt] FROM [dbo].[onboarding_exam_start_approval]
        WHERE [onboardingExamStartApprovalId] = ${item.contextReferenceId}
          AND [isDeleted] = 0 AND [isActive] = 1
      `;
      if (!approvals[0] || approvals[0].status !== "PENDING" || approvals[0].expiresAt.getTime() <= Date.now()) {
        await tx.notificationOutbox.updateMany({ where: { notificationOutboxId: id, status: "PROCESSING", attempts: 0 },
          data: { status: "SKIPPED", lastError: "EXAM_PASSWORD_NO_LONGER_VALID", updatedBy: "SYSTEM" } });
        return false;
      }
    }
    await lockScope(tx, genericScope(item));
    const duplicate = (await genericCandidates(tx, item)).find((other) =>
      other.notificationOutboxId !== id && hasReservedDelivery(other) &&
      sameGenericNotification({ ...item, phoneNumber: phone }, other));
    const result = await tx.notificationOutbox.updateMany({
      where: { notificationOutboxId: id, status: "PROCESSING", attempts, isDeleted: false },
      data: duplicate
        ? { status: "SKIPPED", lastError: `DUPLICATE_OF:${duplicate.notificationOutboxId}`, updatedBy: "SYSTEM" }
        : { attempts: attempts + 1, phoneNumber: phone, lastError: "DELIVERY_RESERVED", updatedBy: "SYSTEM" },
    });
    return !duplicate && result.count === 1;
  }, { maxWait: 15000, timeout: 30000 });

type CaseItem = { caseId: string | null; caseDepartmentId: string | null; meta: string | null; createdAt: Date };
const caseScope = (item: CaseItem) => {
  const meta = metaOf(item.meta);
  const action = upper(String(meta.action ?? ""));
  const occurrence = meta.notificationEventId ??
    (action === "NEW_CASE" ? item.caseId : action === "ADD_DEPARTMENT" ? item.caseDepartmentId : item.createdAt.toISOString());
  return JSON.stringify(["CASE", item.caseId, action, occurrence]);
};
export const claimCaseDelivery = async (id: string, attempts: number, phone: string, message: string) =>
  prismaFlowly.$transaction(async (tx) => {
    const item = await tx.caseNotificationOutbox.findUnique({ where: { caseNotificationId: id } });
    if (!item || attempts !== 0) return false;
    const scope = caseScope(item);
    await lockScope(tx, scope);
    const candidates = await tx.caseNotificationOutbox.findMany({ where: { caseId: item.caseId, channel: "WHATSAPP" } });
    const duplicate = candidates.find((other) => other.caseNotificationId !== id &&
      hasReservedDelivery(other) && caseScope(other) === scope &&
      notificationPhone(other.phoneNumber) === notificationPhone(phone) && other.message.trim() === message.trim());
    const result = await tx.caseNotificationOutbox.updateMany({
      where: { caseNotificationId: id, status: "PROCESSING", attempts, isDeleted: false },
      data: duplicate
        ? { status: "SKIPPED", lastError: `DUPLICATE_OF:${duplicate.caseNotificationId}`, updatedBy: "SYSTEM" }
        : { attempts: attempts + 1, phoneNumber: phone, message, lastError: "DELIVERY_RESERVED", updatedBy: "SYSTEM" },
    });
    return !duplicate && result.count === 1;
  }, { maxWait: 15000, timeout: 30000 });
