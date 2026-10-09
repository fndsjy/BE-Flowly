jest.mock("../src/service/notification-delivery.js", () => jest.requireActual("../src/service/notification-delivery"), { virtual: true });
jest.mock("../src/application/database.js", () => ({ prismaFlowly: { $transaction: jest.fn(), $queryRaw: jest.fn(), notificationOutbox: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() } } }), { virtual: true });
jest.mock("../src/utils/access-scope.js", () => ({ getAccessContext: jest.fn() }), { virtual: true });
jest.mock("../src/error/response-error.js", () => jest.requireActual("../src/error/response-error"), { virtual: true });
jest.mock("../src/service/generic-notification-dispatcher.js", () => ({ dispatchGenericNotificationOutboxItem: jest.fn() }), { virtual: true });
const { prismaFlowly: db } = require("../src/application/database.js");
const { getAccessContext } = require("../src/utils/access-scope.js");
const { dispatchGenericNotificationOutboxItem: dispatch } = require("../src/service/generic-notification-dispatcher.js");
const { FailedNotificationService: service } = require("../src/service/failed-notification-service");
let rows: Map<string, any>;
beforeEach(() => {
  jest.clearAllMocks();
  getAccessContext.mockResolvedValue({ isAdmin: true });
  rows = new Map([["original", { notificationOutboxId: "original", status: "FAILED", attempts: 1, lastError: "DELIVERY_NOT_SENT: conversion unavailable", createdAt: new Date(), meta: '{"channel":"WHATSAPP"}', isDeleted: false, isActive: true, portalKey: "EMPLOYEE", eventKey: "TEST", phoneNumber: "08123456789", message: "Hello" }]]);
  let queue = Promise.resolve();
  db.$transaction.mockImplementation((fn: any) => { const next = queue.then(() => fn(db)); queue = next.catch(() => {}); return next; });
  db.$queryRaw.mockResolvedValue([{ result: 0 }]);
  db.notificationOutbox.findUnique.mockImplementation(async ({ where }: any) => rows.get(where.notificationOutboxId));
  db.notificationOutbox.update.mockImplementation(async ({ where, data }: any) => Object.assign(rows.get(where.notificationOutboxId), data));
  db.notificationOutbox.create.mockImplementation(async ({ data }: any) => { const row = { isActive: true, isDeleted: false, ...data }; rows.set(data.notificationOutboxId, row); return row; });
  dispatch.mockImplementation(async (item: any) => { rows.get(item.notificationOutboxId).status = "SENT"; });
});
test("non-admin cannot read or resend messages", async () => {
  getAccessContext.mockResolvedValue({ isAdmin: false });
  await expect(service.list("employee")).rejects.toThrow("Admin access required");
  await expect(service.retry("employee", "original")).rejects.toThrow("Admin access required");
  expect(db.notificationOutbox.create).not.toHaveBeenCalled();
});
test("manual resend preserves the failed original and creates a linked attempt", async () => {
  const result = await service.retry("admin", "original");
  expect(result.status).toBe("SENT");
  expect(rows.get("original").status).toBe("FAILED");
  const child = rows.get(result.notificationOutboxId);
  expect(JSON.parse(child.meta).manualRetryOf).toBe("original");
  expect(child.phoneNumber).toBe(rows.get("original").phoneNumber);
  expect(child.message).toBe("Hello");
  expect(dispatch).toHaveBeenCalledTimes(1);
});
test("concurrent manual clicks create only one new attempt", async () => {
  const results = await Promise.allSettled([service.retry("admin", "original"), service.retry("admin", "original")]);
  expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
  expect(db.notificationOutbox.create).toHaveBeenCalledTimes(1);
  expect(dispatch).toHaveBeenCalledTimes(1);
});
test.each(["DELIVERY_UNCERTAIN: timeout", "DELIVERY_RESERVED"])("uncertain delivery cannot be resent: %s", async error => {
  rows.get("original").lastError = error;
  await expect(service.retry("admin", "original")).rejects.toThrow("gateway");
  expect(dispatch).not.toHaveBeenCalled();
});
test("expired OTP cannot be resent", async () => {
  rows.get("original").meta = JSON.stringify({ channel: "WHATSAPP", expiresAt: "2000-01-01T00:00:00Z" });
  await expect(service.retry("admin", "original")).rejects.toThrow("kedaluwarsa");
  expect(dispatch).not.toHaveBeenCalled();
});
test("cancelled approval cannot be resent even if metadata expiry is still valid", async () => {
  Object.assign(rows.get("original"), { contextReferenceType: "ONBOARDING_EXAM_START_APPROVAL", contextReferenceId: "approval", meta: JSON.stringify({ channel: "WHATSAPP", stageProgressId: "stage", expiresAt: new Date(Date.now() + 60000).toISOString() }) });
  db.$queryRaw.mockResolvedValueOnce([{ result: 0 }]).mockResolvedValueOnce([{ status: "CANCELLED", expiresAt: new Date(Date.now() + 60000) }]);
  await expect(service.retry("admin", "original")).rejects.toThrow("tidak berlaku");
  expect(dispatch).not.toHaveBeenCalled();
});
test("manual failure is recorded without automatically dispatching again", async () => {
  dispatch.mockRejectedValue(new Error("DELIVERY_UNCERTAIN: connection reset"));
  const result = await service.retry("admin", "original");
  expect(result.status).toBe("FAILED");
  await expect(service.retry("admin", result.notificationOutboxId)).rejects.toThrow("gateway");
  expect(dispatch).toHaveBeenCalledTimes(1);
});

test("legacy failed rows require gateway verification before resend", async () => {
  rows.get("original").lastError = "Provider error without delivery evidence";
  await expect(service.retry("admin", "original")).rejects.toThrow("gateway");
  expect(dispatch).not.toHaveBeenCalled();
});

test("listing starts on 9 October WIB and continues on subsequent days", async () => {
  db.notificationOutbox.findMany.mockResolvedValue([]);
  await service.list("admin");
  const window = db.notificationOutbox.findMany.mock.calls[0][0].where.createdAt;
  expect(window.gte.toISOString()).toBe("2026-10-08T17:00:00.000Z");
  expect(window.lt).toBeUndefined();
});
test("old messages cannot be resent through a stale button", async () => {
  rows.get("original").createdAt = new Date(0);
  await expect(service.retry("admin", "original")).rejects.toThrow("9 Oktober");
  expect(dispatch).not.toHaveBeenCalled();
});
test("explicit SERVICE_OFF rejection allows a manual retry even in an older uncertain record", async () => {
  rows.get("original").lastError = 'DELIVERY_UNCERTAIN: Verify delivery before resending. {"code":400,"results":{"state":"SERVICE_OFF","message":"Service is off"}}';
  const result = await service.retry("admin", "original");
  expect(result.status).toBe("SENT");
  expect(dispatch).toHaveBeenCalledTimes(1);
});

test("service-off wording without a valid structured rejection does not unlock retry", async () => {
  rows.get("original").lastError = 'DELIVERY_UNCERTAIN: {"code":500,"results":{"state":"SERVICE_OFF"}}';
  await expect(service.retry("admin", "original")).rejects.toThrow("gateway");
  expect(dispatch).not.toHaveBeenCalled();
});
