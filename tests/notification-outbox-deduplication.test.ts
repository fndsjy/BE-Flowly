jest.mock("../src/service/notification-delivery.js", () => jest.requireActual("../src/service/notification-delivery"), { virtual: true });
jest.mock("../src/application/database.js", () => ({ prismaFlowly: {
  $transaction: jest.fn(), $queryRaw: jest.fn(),
  notificationOutbox: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
  caseNotificationOutbox: { findUnique: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
} }), { virtual: true });
const { prismaFlowly: db } = require("../src/application/database.js");
const { enqueueUniqueNotifications, claimGenericDelivery, claimCaseDelivery } = require("../src/service/notification-outbox-deduplication");

const makeRow = (id: string, overrides: any = {}) => ({
  notificationOutboxId: id, portalKey: "EMPLOYEE", eventKey: "ONBOARDING_PASSED",
  contextReferenceType: "ONBOARDING_ASSIGNMENT", contextReferenceId: "assignment-1",
  recipientRole: "HRD", phoneNumber: "08123456789", message: "Lulus onboarding",
  meta: '{"channel":"WHATSAPP","onboardingAssignmentId":"assignment-1"}',
  status: "PENDING", attempts: 0, lastError: null, isDeleted: false, ...overrides,
});
let rows: any[];
let caseRows: any[];
beforeEach(() => {
  jest.clearAllMocks(); rows = []; caseRows = [];
  // Model transaction-owned exclusive locks across separate callers.
  let tail = Promise.resolve();
  db.$transaction.mockImplementation((run: any) => {
    const result = tail.then(() => run(db));
    tail = result.catch(() => undefined);
    return result;
  });
  db.$queryRaw.mockResolvedValue([{ result: 0 }]);
  for (const [table, getRows, key] of [
    [db.notificationOutbox, () => rows, "notificationOutboxId"],
    [db.caseNotificationOutbox, () => caseRows, "caseNotificationId"],
  ] as const) {
    table.findUnique.mockImplementation(async ({ where }: any) => getRows().find((r: any) => r[key] === where[key]));
    table.findMany.mockImplementation(async () => getRows().map((r: any) => ({ ...r })));
    table.updateMany.mockImplementation(async ({ where, data }: any) => {
      const row = getRows().find((r: any) => r[key] === where[key] && r.status === where.status && r.attempts === where.attempts && !r.isDeleted);
      if (!row) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    });
  }
  db.notificationOutbox.create.mockImplementation(async ({ data }: any) => { rows.push({ ...data }); return data; });
});

test("concurrent completion requests insert one row even with different outbox IDs", async () => {
  const result = await Promise.all([enqueueUniqueNotifications({ data: [makeRow("a")] }), enqueueUniqueNotifications({ data: [makeRow("b")] })]);
  expect(rows).toHaveLength(1);
  expect(result.map(r => r.notificationOutboxIds)).toEqual([["a"], ["a"]]);
});
test("same phone and message through HRD/PIC are deduplicated, including 0/+62 forms", async () => {
  await enqueueUniqueNotifications({ data: [makeRow("a"), makeRow("b", { recipientRole: "SBU_SUB_PIC", phoneNumber: "+62 812-345-6789" })] });
  expect(rows).toHaveLength(1);
});
test("automatic and manual PASS_OVERRIDE share assignment scope", async () => {
  await enqueueUniqueNotifications({ data: [makeRow("a"), makeRow("b", { contextReferenceType: "ONBOARDING_DECISION", contextReferenceId: "decision-1" })] });
  expect(rows).toHaveLength(1);
});
test("different assignments, events, phones and distinct role messages remain separate", async () => {
  const different = [makeRow("a"), makeRow("b", { contextReferenceId: "assignment-2", meta: '{"channel":"WHATSAPP","onboardingAssignmentId":"assignment-2"}' }),
    makeRow("c", { eventKey: "ONBOARDING_EXAM_STARTED" }), makeRow("d", { phoneNumber: "08111111111" }),
    makeRow("e", { recipientRole: "PARTICIPANT", message: "Your login information" })];
  await enqueueUniqueNotifications({ data: different }); expect(rows).toHaveLength(5);
});
test("two existing queued duplicates reserve only one send", async () => {
  rows = [makeRow("a", { status: "PROCESSING" }), makeRow("b", { status: "PROCESSING", recipientRole: "SBU_SUB_PIC" })];
  const result = await Promise.all([claimGenericDelivery("a", 0, "628123456789"), claimGenericDelivery("b", 0, "628123456789")]);
  expect(result).toEqual([true, false]); expect(rows[1].status).toBe("SKIPPED");
  expect(rows[1].lastError).toBe("DUPLICATE_OF:a");
});
test("previously attempted rows cannot reserve another send", async () => {
  rows = [makeRow("a", { status: "PROCESSING", attempts: 1, lastError: "DELIVERY_PREPARING" }),
    makeRow("b", { status: "PROCESSING", attempts: 1, lastError: "DELIVERY_PREPARING" })];
  expect(await Promise.all([claimGenericDelivery("a", 1, "628123456789"), claimGenericDelivery("b", 1, "628123456789")])).toEqual([false, false]);
});
test("legacy rows can use template channel when metadata omits it", async () => {
  rows = [makeRow("a", { status: "SENT", attempts: 1, meta: "{}", template: { channel: "WHATSAPP" } }), makeRow("b", { status: "PROCESSING" })];
  expect(await claimGenericDelivery("b", 0, "628123456789")).toBe(false);
});
test.each(["SENT", "PROCESSING", "FAILED"])("a %s reservation blocks a duplicate after restart", async (status) => {
  rows = [makeRow("a", { status, attempts: 1, lastError: status === "FAILED" ? "DELIVERY_UNCERTAIN: timeout" : null }), makeRow("b", { status: "PROCESSING" })];
  expect(await claimGenericDelivery("b", 0, "628123456789")).toBe(false);
});
test("a conversion failure before send does not block another queued notification", async () => {
  rows = [makeRow("a", { status: "FAILED", attempts: 3, lastError: "conversion unavailable" }), makeRow("b", { status: "PROCESSING" })];
  expect(await claimGenericDelivery("b", 0, "628123456789")).toBe(true);
});
test("manual batch deduplicates one phone listed under multiple employees", async () => {
  const manual = { contextReferenceType: "ADMIN_MANUAL_NOTIFICATION", meta: '{"channel":"WHATSAPP","requestedBy":"admin"}' };
  rows = [makeRow("a", { ...manual, contextReferenceId: "10:123456", status: "SENT", attempts: 1 }), makeRow("b", { ...manual, contextReferenceId: "20:123456", status: "PROCESSING" })];
  expect(await claimGenericDelivery("b", 0, "628123456789")).toBe(false);
  rows.push(makeRow("c", { ...manual, contextReferenceId: "20:654321", status: "PROCESSING" }));
  expect(await claimGenericDelivery("c", 0, "628123456789")).toBe(true);
});
test("lock failure prevents both creation and delivery reservation", async () => {
  db.$queryRaw.mockResolvedValue([{ result: -1 }]);
  await expect(enqueueUniqueNotifications({ data: [makeRow("a")] })).rejects.toThrow("lock unavailable");
  rows = [makeRow("a", { status: "PROCESSING" })];
  await expect(claimGenericDelivery("a", 0, "628123456789")).rejects.toThrow("lock unavailable");
  expect(rows[0].attempts).toBe(0);
});
test("case fanout sends identical comment once, but another comment is a new event", async () => {
  const base = { caseId: "case-1", caseDepartmentId: "dept-1", createdAt: new Date(), channel: "WHATSAPP", phoneNumber: "08123456789", message: "Comment", status: "PROCESSING", attempts: 0, lastError: null, isDeleted: false };
  caseRows = ["a", "b", "c"].map((id) => ({ ...base, caseNotificationId: id, meta: JSON.stringify({ action: "FEEDBACK_COMMENT", notificationEventId: id === "c" ? "comment-2" : "comment-1" }) }));
  expect(await Promise.all(caseRows.map(r => claimCaseDelivery(r.caseNotificationId, 0, "628123456789", "Comment")))).toEqual([true, false, true]);
});

test.each(["CANCELLED", "expired"])("an invalid exam password is not sent: %s", async status => {
  rows = [makeRow("otp", { status: "PROCESSING", contextReferenceType: "ONBOARDING_EXAM_START_APPROVAL", meta: '{"channel":"WHATSAPP","stageProgressId":"stage"}' })];
  db.$queryRaw.mockResolvedValueOnce([{ result: 0 }]).mockResolvedValueOnce([{ status: status === "expired" ? "PENDING" : status, expiresAt: status === "expired" ? new Date(0) : new Date(Date.now() + 60000) }]);
  expect(await claimGenericDelivery("otp", 0, "628123456789")).toBe(false);
  expect(rows[0].status).toBe("SKIPPED");
});

test("explicit service-off legacy failure does not suppress a deliberate new attempt", async () => {
  rows = [makeRow("a", { status: "FAILED", attempts: 1, lastError: 'DELIVERY_UNCERTAIN: {"code":400,"results":{"state":"SERVICE_OFF"}}' }), makeRow("b", { status: "PROCESSING" })];
  expect(await claimGenericDelivery("b", 0, "628123456789")).toBe(true);
});
