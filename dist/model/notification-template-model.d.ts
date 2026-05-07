export type NotificationTemplatePortalMappingRecord = {
    notificationTemplatePortalId: string;
    portalKey: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type NotificationTemplateRecord = {
    notificationTemplateId: string;
    templateName: string;
    channel: string;
    eventKey: string;
    recipientRole: string;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    portalMappings?: NotificationTemplatePortalMappingRecord[] | null;
};
export type NotificationTemplatePortalMappingResponse = {
    notificationTemplatePortalId: string;
    portalKey: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type NotificationTemplateResponse = {
    notificationTemplateId: string;
    templateName: string;
    channel: string;
    eventKey: string;
    recipientRole: string;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    appliesToAllPortals: boolean;
    portalKeys: string[];
    portalMappings: NotificationTemplatePortalMappingResponse[];
};
export type NotificationTemplateListResponse = NotificationTemplateResponse;
export type CreateNotificationTemplateRequest = {
    templateName: string;
    channel: string;
    eventKey: string;
    recipientRole: string;
    messageTemplate: string;
    portalKeys?: string[];
    isActive?: boolean;
};
export type UpdateNotificationTemplateRequest = {
    notificationTemplateId: string;
    templateName?: string;
    channel?: string;
    eventKey?: string;
    recipientRole?: string;
    messageTemplate?: string;
    portalKeys?: string[];
    isActive?: boolean;
};
export type DeleteNotificationTemplateRequest = {
    notificationTemplateId: string;
};
export type TestNotificationRecipientResult = {
    userId: number;
    employeeName: string | null;
    phoneNumber: string | null;
    notificationOutboxId: string | null;
    status: string;
    error: string | null;
};
export type TestWhatsappNotificationResponse = {
    configuredUserIds: number[];
    sent: number;
    pending: number;
    failed: number;
    skipped: number;
    recipients: TestNotificationRecipientResult[];
};
export declare const toNotificationTemplatePortalMappingResponse: (item: NotificationTemplatePortalMappingRecord) => NotificationTemplatePortalMappingResponse;
export declare function toNotificationTemplateResponse(item: NotificationTemplateRecord): NotificationTemplateResponse;
export declare const toNotificationTemplateListResponse: typeof toNotificationTemplateResponse;
//# sourceMappingURL=notification-template-model.d.ts.map