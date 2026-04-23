import { type CreateNotificationTemplateRequest, type DeleteNotificationTemplateRequest, type UpdateNotificationTemplateRequest } from "../model/notification-template-model.js";
export declare class NotificationTemplateService {
    static create(requesterId: string, reqBody: CreateNotificationTemplateRequest): Promise<import("../model/notification-template-model.js").NotificationTemplateResponse>;
    static update(requesterId: string, reqBody: UpdateNotificationTemplateRequest): Promise<import("../model/notification-template-model.js").NotificationTemplateResponse>;
    static softDelete(requesterId: string, reqBody: DeleteNotificationTemplateRequest): Promise<import("../model/notification-template-model.js").NotificationTemplateResponse>;
    static list(requesterId: string, filters?: {
        channel?: string;
        eventKey?: string;
        recipientRole?: string;
        isActive?: boolean;
        portalKey?: string;
    }): Promise<import("../model/notification-template-model.js").NotificationTemplateResponse[]>;
}
//# sourceMappingURL=notification-template-service.d.ts.map