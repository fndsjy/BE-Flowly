export const isServiceOffResponse = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  const data = value as { code?: unknown; results?: { state?: unknown } };
  return data.code === 400 && data.results?.state === "SERVICE_OFF";
};
export const isRecordedServiceOff = (lastError: string | null): boolean => {
  if (!lastError) return false;
  const start = lastError.indexOf("{");
  if (start < 0) return false;
  try { return isServiceOffResponse(JSON.parse(lastError.slice(start))); } catch { return false; }
};
export const isDefiniteNoSendFailure = (lastError: string | null): boolean =>
  Boolean(lastError?.startsWith("DELIVERY_NOT_SENT:")) || isRecordedServiceOff(lastError);
export class NotificationDeliveryNotSentError extends Error {}

// A send may have reached WhatsApp even when its response or the SENT write fails.
// Never automatically replay such a request without provider reconciliation.
export class NotificationDeliveryUncertainError extends Error {
  constructor(cause: unknown) {
    super(`DELIVERY_UNCERTAIN: Verify delivery before resending. ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

export const sendAndRecordNotification = async (
  send: () => Promise<{ ok: boolean; data?: unknown; error?: unknown }>,
  recordSent: () => Promise<void>
) => {
  try {
    const result = await send();
    if (!result.ok) {
      if (isServiceOffResponse(result.data)) throw new NotificationDeliveryNotSentError(JSON.stringify(result.data));
      throw new Error(JSON.stringify(result.data ?? result.error ?? "Provider rejected send"));
    }
    await recordSent();
  } catch (error) {
    if (error instanceof NotificationDeliveryNotSentError) throw error;
    throw new NotificationDeliveryUncertainError(error);
  }
};
