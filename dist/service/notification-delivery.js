export const isServiceOffResponse = (value) => {
    if (!value || typeof value !== "object")
        return false;
    const data = value;
    return data.code === 400 && data.results?.state === "SERVICE_OFF";
};
export const isRecordedServiceOff = (lastError) => {
    if (!lastError)
        return false;
    const start = lastError.indexOf("{");
    if (start < 0)
        return false;
    try {
        return isServiceOffResponse(JSON.parse(lastError.slice(start)));
    }
    catch {
        return false;
    }
};
export const isDefiniteNoSendFailure = (lastError) => Boolean(lastError?.startsWith("DELIVERY_NOT_SENT:")) || isRecordedServiceOff(lastError);
export class NotificationDeliveryNotSentError extends Error {
}
// A send may have reached WhatsApp even when its response or the SENT write fails.
// Never automatically replay such a request without provider reconciliation.
export class NotificationDeliveryUncertainError extends Error {
    constructor(cause) {
        super(`DELIVERY_UNCERTAIN: Verify delivery before resending. ${cause instanceof Error ? cause.message : String(cause)}`);
    }
}
export const sendAndRecordNotification = async (send, recordSent) => {
    try {
        const result = await send();
        if (!result.ok) {
            if (isServiceOffResponse(result.data))
                throw new NotificationDeliveryNotSentError(JSON.stringify(result.data));
            throw new Error(JSON.stringify(result.data ?? result.error ?? "Provider rejected send"));
        }
        await recordSent();
    }
    catch (error) {
        if (error instanceof NotificationDeliveryNotSentError)
            throw error;
        throw new NotificationDeliveryUncertainError(error);
    }
};
//# sourceMappingURL=notification-delivery.js.map