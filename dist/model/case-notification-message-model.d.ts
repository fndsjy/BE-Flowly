export type CaseNotificationMessageRecord = {
    caseNotificationMessageId: string;
    caseId: string | null;
    caseDepartmentId: string | null;
    recipientEmployeeId: number | null;
    role: string;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseNotificationMessageResponse = {
    caseNotificationMessageId: string;
    caseId: string | null;
    caseDepartmentId: string | null;
    recipientEmployeeId: number | null;
    role: string;
    messageTemplate: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseNotificationMessageListResponse = CaseNotificationMessageResponse;
export type CreateCaseNotificationMessageRequest = {
    caseId: string;
    caseDepartmentId?: string | null;
    recipientEmployeeId: number;
    role: string;
    messageTemplate: string;
    isActive?: boolean;
};
export type UpdateCaseNotificationMessageRequest = {
    caseNotificationMessageId: string;
    messageTemplate?: string;
    isActive?: boolean;
};
export type DeleteCaseNotificationMessageRequest = {
    caseNotificationMessageId: string;
};
export declare function toCaseNotificationMessageResponse(item: CaseNotificationMessageRecord): CaseNotificationMessageResponse;
export declare const toCaseNotificationMessageListResponse: typeof toCaseNotificationMessageResponse;
//# sourceMappingURL=case-notification-message-model.d.ts.map