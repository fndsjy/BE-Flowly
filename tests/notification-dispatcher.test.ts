jest.mock("../src/application/database.js", () => ({
  prismaFlowly: {
    notificationOutbox: { findUnique: jest.fn(), findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    caseNotificationOutbox: { findUnique: jest.fn(), findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(async () => [{ result: 0 }]),
    caseNotificationTemplate: { findFirst: jest.fn(async () => ({ messageTemplate: "Hello" })) },
  },
  prismaEmployee: {},
}), { virtual: true });
jest.mock("../src/application/logging.js", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}), { virtual: true });
jest.mock("../src/service/whapi-service.js", () => ({
  convertWhapiNumber: jest.fn(), sendWhapiMessage: jest.fn(),
}), { virtual: true });
jest.mock("../src/service/notification-delivery.js", () =>
  jest.requireActual("../src/service/notification-delivery"), { virtual: true });
jest.mock("../src/service/notification-outbox-deduplication.js", () =>
  jest.requireActual("../src/service/notification-outbox-deduplication"), { virtual: true });

const { prismaFlowly } = require("../src/application/database.js");
const { convertWhapiNumber, sendWhapiMessage } = require("../src/service/whapi-service.js");
const { processGenericNotificationOutbox } = require("../src/service/generic-notification-dispatcher");
const { processNotificationOutbox } = require("../src/service/case-notification-dispatcher");

describe.each([
  ["generic", "notificationOutbox", "notificationOutboxId", processGenericNotificationOutbox],
  ["case", "caseNotificationOutbox", "caseNotificationId", processNotificationOutbox],
])("%s notification delivery", (_name, model, key, processOutbox) => {
  let row: any;
  let table: any;
  beforeEach(() => {
    jest.clearAllMocks();
    row = { [key]: "test-1", status: "PENDING", attempts: 0, phoneNumber: "08123456789",
      message: "Hello", channel: "WHATSAPP", meta: '{"channel":"WHATSAPP","role":"PIC"}',
      portalKey: "EMPLOYEE", eventKey: "ONBOARDING_PASSED", contextReferenceId: "assignment-1",
      contextReferenceType: "ONBOARDING_ASSIGNMENT", caseId: null, createdAt: new Date() };
    table = prismaFlowly[model];
    table.findUnique.mockImplementation(async () => ({ ...row }));
    prismaFlowly.$transaction.mockImplementation(async (run: any) => run(prismaFlowly));
    table.findMany.mockImplementation(async ({ where }: any) => row.status === "PENDING" && row.attempts === where.attempts ? [{ ...row }] : []);
    table.updateMany.mockImplementation(async ({ where, data }: any) => {
      const matchesAttempts = typeof where.attempts === "number"
        ? where.attempts === row.attempts : row.attempts > where.attempts.gt;
      if (where.status !== row.status || !matchesAttempts) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    });
    table.update.mockImplementation(async ({ data }: any) => Object.assign(row, data));
    convertWhapiNumber.mockResolvedValue({ ok: true, number: "628123456789" });
    sendWhapiMessage.mockResolvedValue({ ok: true });
  });

  test("a successful send followed by a database error is never sent again", async () => {
    table.update.mockImplementation(async ({ data }: any) => {
      if (data.status === "SENT") throw new Error("database disconnected");
      return Object.assign(row, data);
    });
    await processOutbox();
    await processOutbox();
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("FAILED");
    expect(row.lastError).toContain("DELIVERY_UNCERTAIN");
  });

  test.each(["network", "provider"])("does not replay an ambiguous %s failure", async (failure) => {
    if (failure === "network") sendWhapiMessage.mockRejectedValue(new Error("connection reset"));
    else sendWhapiMessage.mockResolvedValue({ ok: false, data: { code: 500 } });
    await processOutbox();
    await processOutbox();
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("FAILED");
  });

  test.each(["exception", "rejection"])("conversion %s fails permanently without retry", async (failure) => {
    if (failure === "exception") convertWhapiNumber.mockRejectedValueOnce(new Error("conversion unavailable"));
    else convertWhapiNumber.mockResolvedValueOnce({ ok: false, error: "conversion unavailable" });
    await processOutbox();
    await processOutbox();
    expect(row.status).toBe("FAILED");
    expect(row.attempts).toBe(1);
    expect(convertWhapiNumber).toHaveBeenCalledTimes(1);
    expect(sendWhapiMessage).not.toHaveBeenCalled();
  });

  test("pending attempts from an older version become failed without sending", async () => {
    row.attempts = 1;
    row.lastError = "previous failure";
    await processOutbox();
    expect(row.status).toBe("FAILED");
    expect(row.lastError).toBe("previous failure");
    expect(convertWhapiNumber).not.toHaveBeenCalled();
    expect(sendWhapiMessage).not.toHaveBeenCalled();
  });

  test("SERVICE_OFF is recorded as definitely not sent without automatic retry", async () => {
    sendWhapiMessage.mockResolvedValue({ ok: false, data: { code: 400, results: { state: "SERVICE_OFF", message: "Service off" } } });
    await processOutbox(); await processOutbox();
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("FAILED");
    expect(row.lastError).toContain("DELIVERY_NOT_SENT:");
    expect(row.lastError).not.toContain("DELIVERY_UNCERTAIN:");
  });

  test("a stale worker cannot claim an already retried row", async () => {
    table.findMany.mockImplementationOnce(async () => {
      const stale = { ...row };
      row.attempts = 1;
      return [stale];
    });
    await processOutbox();
    expect(sendWhapiMessage).not.toHaveBeenCalled();
  });

  test("a database outage after sending leaves a durable hold", async () => {
    table.update.mockRejectedValue(new Error("database unavailable"));
    await processOutbox();
    await processOutbox();
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("PROCESSING");
    expect(row.attempts).toBe(1);
  });

  test("overlapping ticks send only once and persist the attempt first", async () => {
    sendWhapiMessage.mockImplementation(async () => {
      expect(row.status).toBe("PROCESSING");
      expect(row.attempts).toBe(1);
      return { ok: true };
    });
    await Promise.all([processOutbox(), processOutbox()]);
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("SENT");
  });

  test("independent worker instances cannot send the same pending row twice", async () => {
    let otherWorker: () => Promise<void>;
    jest.isolateModules(() => {
      otherWorker = model === "notificationOutbox"
        ? require("../src/service/generic-notification-dispatcher").processGenericNotificationOutbox
        : require("../src/service/case-notification-dispatcher").processNotificationOutbox;
    });
    await Promise.all([processOutbox(), otherWorker!()]);
    expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
    expect(row.status).toBe("SENT");
  });

  if (model === "notificationOutbox") {
    test("the direct admin test path cannot send the same row twice", async () => {
      const { dispatchGenericNotificationOutboxItem } = require("../src/service/generic-notification-dispatcher");
      row.status = "PROCESSING";
      const item = { ...row };
      await Promise.all([
        dispatchGenericNotificationOutboxItem(item),
        dispatchGenericNotificationOutboxItem(item),
      ]);
      await dispatchGenericNotificationOutboxItem(item);
      expect(sendWhapiMessage).toHaveBeenCalledTimes(1);
      expect(row.status).toBe("SENT");
    });
  }
});
