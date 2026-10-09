export type DeliveryState = "PENDING" | "SENT" | "FAILED" | "UNCERTAIN";
export declare const deliveryState: (rows: Array<{
    status: string;
    attempts: number;
    lastError: string | null;
}>) => DeliveryState;
//# sourceMappingURL=notification-delivery-status.d.ts.map