export type CaseNotificationTemplateRecord = {
    caseNotificationTemplateId: string;
    templateName: string;
    channel: string;
    role: string;
    action: string | null;
    caseType: string | null;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseNotificationTemplateResponse = {
    caseNotificationTemplateId: string;
    templateName: string;
    channel: string;
    role: string;
    action: string | null;
    caseType: string | null;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseNotificationTemplateListResponse = CaseNotificationTemplateResponse;
export type CreateCaseNotificationTemplateRequest = {
    templateName: string;
    channel: string;
    role: string;
    action?: string | null;
    caseType?: string | null;
    messageTemplate: string;
    isActive?: boolean;
};
export type UpdateCaseNotificationTemplateRequest = {
    caseNotificationTemplateId: string;
    templateName?: string;
    channel?: string;
    role?: string;
    action?: string | null;
    caseType?: string | null;
    messageTemplate?: string;
    isActive?: boolean;
};
export type DeleteCaseNotificationTemplateRequest = {
    caseNotificationTemplateId: string;
};
export declare function toCaseNotificationTemplateResponse(item: CaseNotificationTemplateRecord): CaseNotificationTemplateResponse;
export declare const toCaseNotificationTemplateListResponse: typeof toCaseNotificationTemplateResponse;
//# sourceMappingURL=case-notification-template-model.d.ts.map