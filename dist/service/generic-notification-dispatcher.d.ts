export declare const dispatchGenericNotificationOutboxItem: (item: {
    notificationOutboxId: string;
    phoneNumber: string;
    message: string;
    attempts: number;
    meta?: string | null;
    template?: {
        channel?: string | null;
    } | null;
}) => Promise<void>;
export declare const processGenericNotificationOutbox: () => Promise<void>;
//# sourceMappingURL=generic-notification-dispatcher.d.ts.map