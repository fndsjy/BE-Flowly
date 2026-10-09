jest.mock("../src/service/notification-delivery.js", () => jest.requireActual("../src/service/notification-delivery"), { virtual: true });
const { deliveryState } = require("../src/service/notification-delivery-status");
const row = (status: string, lastError: string | null = "DELIVERY_NOT_SENT: test failure", attempts = 1) => ({ status, lastError, attempts });
test("a successful recipient allows the employee to continue despite another failure", () => {
  expect(deliveryState([row("SENT"), row("FAILED")])).toBe("SENT");
});
test("all definite failures allow a new employee request", () => {
  expect(deliveryState([row("FAILED", "DELIVERY_NOT_SENT: conversion failed"), row("FAILED", "DELIVERY_NOT_SENT: invalid phone")])).toBe("FAILED");
});
test.each([[row("FAILED"), row("PENDING", null, 0)], [row("PROCESSING", "DELIVERY_PREPARING", 0)], []])("unfinished delivery stays pending: %j", (...rows: any[]) => {
  expect(deliveryState(rows)).toBe("PENDING");
});
test.each([row("FAILED", "DELIVERY_UNCERTAIN: timeout")])("ambiguous delivery blocks another request: %j", (item) => {
  expect(deliveryState([row("FAILED"), item])).toBe("UNCERTAIN");
});

test("legacy failures without evidence stay uncertain", () => { expect(deliveryState([row("FAILED", "old provider error")])).toBe("UNCERTAIN"); });

test("an in-flight send remains pending, then becomes sent when the provider acknowledges", () => {
  const sending = row("PROCESSING", "DELIVERY_RESERVED");
  expect(deliveryState([sending])).toBe("PENDING");
  expect(deliveryState([{ ...sending, status: "SENT", lastError: null }])).toBe("SENT");
});
test("unknown legacy statuses cannot be treated as definitely not sent", () => {
  expect(deliveryState([row("TES", null)])).toBe("UNCERTAIN");
});
