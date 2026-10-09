jest.mock("../src/service/notification-delivery.js", () => jest.requireActual("../src/service/notification-delivery"), { virtual: true });
jest.mock("../src/application/database.js", () => ({ prismaFlowly: { $transaction: jest.fn(), $queryRaw: jest.fn(), onboardingStageProgress: { findFirst: jest.fn() }, notificationOutbox: { findMany: jest.fn() } }, prismaEmployee: {} }), { virtual: true });
jest.mock("../src/application/logging.js", () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }), { virtual: true });
jest.mock("../src/error/response-error.js", () => jest.requireActual("../src/error/response-error"), { virtual: true });
jest.mock("../src/service/notification-delivery-status.js", () => jest.requireActual("../src/service/notification-delivery-status"), { virtual: true });
jest.mock("../src/service/notification-outbox-deduplication.js", () => ({}), { virtual: true });
jest.mock("../src/utils/id-generator.js", () => ({}), { virtual: true });
jest.mock("../src/utils/admin-access.js", () => ({}), { virtual: true });
jest.mock("../src/utils/audit-log.js", () => ({}), { virtual: true });
jest.mock("../src/application/profile-cache.js", () => ({}), { virtual: true });
jest.mock("../src/service/onboarding-employee-schedule-sync-service.js", () => ({}), { virtual: true });
jest.mock("../src/service/onboarding-service.js", () => ({}), { virtual: true });
jest.mock("../src/service/onboarding-material-service.js", () => ({}), { virtual: true });
const { prismaFlowly: db } = require("../src/application/database.js");
const { OnboardingExamRuntimeService: service } = require("../src/service/onboarding-exam-runtime-service");
beforeEach(() => {
  jest.restoreAllMocks(); jest.clearAllMocks();
  let queue = Promise.resolve();
  db.$transaction.mockImplementation((fn: any) => { const next = queue.then(() => fn(db)); queue = next.catch(() => {}); return next; });
  db.$queryRaw.mockResolvedValue([{ result: 0 }]);
});
test("concurrent employee requests reuse the same approval", async () => {
  let state = { deliveryStatus: "NONE" };
  jest.spyOn(service, "getStartApprovalStatus").mockImplementation(async () => state);
  const create = jest.spyOn(service, "createStartApproval").mockImplementation(async () => {
    state = { deliveryStatus: "PENDING" };
    return { approvalRequired: true, approvalId: "approval-1" };
  });
  await Promise.all([service.requestStartApproval("employee", { onboardingStageProgressId: "stage" }), service.requestStartApproval("employee", { onboardingStageProgressId: "stage" })]);
  expect(create).toHaveBeenCalledTimes(1);
});
test.each(["PENDING", "SENT", "UNCERTAIN"])("existing %s delivery cannot create a second password", async status => {
  jest.spyOn(service, "getStartApprovalStatus").mockResolvedValue({ approvalId: "existing", deliveryStatus: status });
  const create = jest.spyOn(service, "createStartApproval");
  const result = await service.requestStartApproval("employee", { onboardingStageProgressId: "stage" });
  expect(result.approvalId).toBe("existing");
  expect(create).not.toHaveBeenCalled();
});
test.each(["FAILED", "EXPIRED"])("%s delivery permits a deliberate new request", async status => {
  jest.spyOn(service, "getStartApprovalStatus").mockResolvedValue({ deliveryStatus: status });
  const create = jest.spyOn(service, "createStartApproval").mockResolvedValue({ approvalRequired: true, approvalId: "new" });
  const result = await service.requestStartApproval("employee", { onboardingStageProgressId: "stage" });
  expect(result.deliveryStatus).toBe("PENDING"); expect(create).toHaveBeenCalledTimes(1);
});
test("lock failure prevents creation", async () => {
  db.$queryRaw.mockResolvedValue([{ result: -1 }]);
  const create = jest.spyOn(service, "createStartApproval");
  await expect(service.requestStartApproval("employee", { onboardingStageProgressId: "stage" })).rejects.toThrow("diproses");
  expect(create).not.toHaveBeenCalled();
});
test("status is authorized by employee assignment before reading notifications", async () => {
  db.onboardingStageProgress.findFirst.mockResolvedValue(null);
  await expect(service.getStartApprovalStatus("other-employee", "stage")).rejects.toThrow();
  expect(db.onboardingStageProgress.findFirst.mock.calls[0][0].where.assignment.participantReferenceId).toBe("other-employee");
  expect(db.notificationOutbox.findMany).not.toHaveBeenCalled();
});
test("expired but uncertain delivery stays blocked", async () => {
  db.onboardingStageProgress.findFirst.mockResolvedValue({ assignment: { participantReferenceId: "employee" } });
  db.$queryRaw.mockResolvedValue([{ approvalId: "approval", expiresAt: new Date(0) }]);
  db.notificationOutbox.findMany.mockResolvedValue([{ status: "FAILED", attempts: 1, lastError: "DELIVERY_UNCERTAIN: timeout" }]);
  const result = await service.getStartApprovalStatus("employee", "stage");
  expect(result.deliveryStatus).toBe("UNCERTAIN");
});

test("an unexpired in-flight send remains pending and does not create another password", async () => {
  db.onboardingStageProgress.findFirst.mockResolvedValue({ assignment: { participantReferenceId: "employee" } });
  db.$queryRaw.mockResolvedValue([{ approvalId: "approval", expiresAt: new Date(Date.now() + 60000) }]);
  db.notificationOutbox.findMany.mockResolvedValue([{ status: "PROCESSING", attempts: 1, lastError: "DELIVERY_RESERVED" }]);
  const create = jest.spyOn(service, "createStartApproval");
  expect((await service.requestStartApproval("employee", { onboardingStageProgressId: "stage" })).deliveryStatus).toBe("PENDING");
  expect(create).not.toHaveBeenCalled();
});
test("expiry cannot release a password whose send is still in flight", async () => {
  db.onboardingStageProgress.findFirst.mockResolvedValue({ assignment: { participantReferenceId: "employee" } });
  db.$queryRaw.mockResolvedValue([{ approvalId: "approval", expiresAt: new Date(0) }]);
  db.notificationOutbox.findMany.mockResolvedValue([{ status: "PROCESSING", attempts: 1, lastError: "DELIVERY_RESERVED" }]);
  const create = jest.spyOn(service, "createStartApproval");
  expect((await service.requestStartApproval("employee", { onboardingStageProgressId: "stage" })).deliveryStatus).toBe("UNCERTAIN");
  expect(create).not.toHaveBeenCalled();
});
