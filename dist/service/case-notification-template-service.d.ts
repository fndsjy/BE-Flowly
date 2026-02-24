import { type CreateCaseNotificationTemplateRequest, type UpdateCaseNotificationTemplateRequest, type DeleteCaseNotificationTemplateRequest } from "../model/case-notification-template-model.js";
export declare class CaseNotificationTemplateService {
    static create(requesterId: string, reqBody: CreateCaseNotificationTemplateRequest): Promise<import("../model/case-notification-template-model.js").CaseNotificationTemplateResponse>;
    static update(requesterId: string, reqBody: UpdateCaseNotificationTemplateRequest): Promise<import("../model/case-notification-template-model.js").CaseNotificationTemplateResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseNotificationTemplateRequest): Promise<import("../model/case-notification-template-model.js").CaseNotificationTemplateResponse>;
    static list(requesterId: string, filters?: {
        channel?: string;
        role?: string;
        action?: string | null;
        caseType?: string | null;
        isActive?: boolean;
    }): Promise<import("../model/case-notification-template-model.js").CaseNotificationTemplateResponse[]>;
}
//# sourceMappingURL=case-notification-template-service.d.ts.map