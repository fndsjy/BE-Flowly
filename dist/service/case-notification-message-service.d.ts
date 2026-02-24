import { type CreateCaseNotificationMessageRequest, type UpdateCaseNotificationMessageRequest, type DeleteCaseNotificationMessageRequest } from "../model/case-notification-message-model.js";
export declare class CaseNotificationMessageService {
    static create(requesterId: string, reqBody: CreateCaseNotificationMessageRequest): Promise<import("../model/case-notification-message-model.js").CaseNotificationMessageResponse>;
    static update(requesterId: string, reqBody: UpdateCaseNotificationMessageRequest): Promise<import("../model/case-notification-message-model.js").CaseNotificationMessageResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseNotificationMessageRequest): Promise<import("../model/case-notification-message-model.js").CaseNotificationMessageResponse>;
    static list(requesterId: string, filters?: {
        caseId?: string;
        caseDepartmentId?: string;
        recipientEmployeeId?: number;
        role?: string;
    }): Promise<import("../model/case-notification-message-model.js").CaseNotificationMessageResponse[]>;
}
//# sourceMappingURL=case-notification-message-service.d.ts.map