export declare const isServiceOffResponse: (value: unknown) => boolean;
export declare const isRecordedServiceOff: (lastError: string | null) => boolean;
export declare const isDefiniteNoSendFailure: (lastError: string | null) => boolean;
export declare class NotificationDeliveryNotSentError extends Error {
}
export declare class NotificationDeliveryUncertainError extends Error {
    constructor(cause: unknown);
}
export declare const sendAndRecordNotification: (send: () => Promise<{
    ok: boolean;
    data?: unknown;
    error?: unknown;
}>, recordSent: () => Promise<void>) => Promise<void>;
//# sourceMappingURL=notification-delivery.d.ts.map