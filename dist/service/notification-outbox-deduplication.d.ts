import type { Prisma } from "../generated/flowly/client.js";
export declare const notificationPhone: (value: string) => string;
type GenericItem = Pick<Prisma.NotificationOutboxCreateManyInput, "portalKey" | "eventKey" | "contextReferenceType" | "contextReferenceId" | "recipientRole" | "phoneNumber" | "message" | "meta"> & {
    template?: {
        channel: string;
    } | null;
};
export declare const sameGenericNotification: (left: GenericItem, right: GenericItem) => boolean;
export declare const enqueueUniqueNotifications: (args: {
    data: Prisma.NotificationOutboxCreateManyInput[];
}) => Promise<{
    count: number;
    notificationOutboxIds: string[];
}>;
export declare const claimGenericDelivery: (id: string, attempts: number, phone: string) => Promise<boolean>;
export declare const claimCaseDelivery: (id: string, attempts: number, phone: string, message: string) => Promise<boolean>;
export {};
//# sourceMappingURL=notification-outbox-deduplication.d.ts.map