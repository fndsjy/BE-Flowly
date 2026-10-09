jest.mock("../src/application/logging.js", () => ({ logger: { info: jest.fn(), warn: jest.fn() } }), { virtual: true });
process.env.WHAPI_BASE_URL = "http://gateway.invalid/api";
process.env.WHAPI_API_KEY = "test-only-key";
const { sendWhapiMessage } = require("../src/service/whapi-service");
const { logger } = require("../src/application/logging.js");
const originalFetch = global.fetch;
beforeEach(() => { jest.clearAllMocks(); global.fetch = jest.fn() as any; });
afterEach(() => { global.fetch = originalFetch; });
test("one send invokes the gateway once and correlates request and response", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: 200, results: { id: "provider-1" } }) });
  expect((await sendWhapiMessage("628123456789", "test message", { referenceId: "outbox-1" })).ok).toBe(true);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const request = logger.info.mock.calls.find(([message]: any[]) => message === "Sending WHAPI message")[1];
  const response = logger.info.mock.calls.find(([message]: any[]) => message === "WHAPI sendMessage response")[1];
  expect(response.sendAttemptId).toBe(request.sendAttemptId);
  expect(response.processId).toBe(process.pid);
  expect(response.providerMessageId).toBe("provider-1");
});
test("a transport failure is logged and never retried by the HTTP wrapper", async () => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error("connection reset"));
  await expect(sendWhapiMessage("628123456789", "test message", { referenceId: "outbox-1" })).rejects.toThrow("connection reset");
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(logger.warn).toHaveBeenCalledWith("WHAPI sendMessage transport error", expect.objectContaining({ referenceId: "outbox-1", sendAttemptId: expect.any(String) }));
});
test("HTTP 200 with SERVICE_OFF is rejected without a second HTTP call", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: 400, results: { state: "SERVICE_OFF" } }) });
  expect((await sendWhapiMessage("628123456789", "test message")).ok).toBe(false);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
