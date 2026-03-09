export declare class CaseNotificationService {
    static enqueuePicNotifications(params: {
        caseId: string;
        caseTitle: string;
        caseType: string;
        departmentMap: Map<number, string>;
        requesterId: string;
    }): Promise<void>;
    static enqueueAssigneeNotification(params: {
        caseId: string;
        caseDepartmentId: string;
        sbuSubId: number;
        assigneeEmployeeId: number;
        requesterId: string;
    }): Promise<void>;
    static enqueueAssigneeNotifications(params: {
        caseId: string;
        caseDepartmentId: string;
        sbuSubId: number;
        assigneeEmployeeIds: number[];
        requesterId: string;
    }): Promise<void>;
    static enqueueDepartmentAddedNotification(params: {
        caseId: string;
        caseDepartmentId: string;
        sbuSubId: number;
        requesterId: string;
    }): Promise<void>;
    static enqueueRequesterDecisionNotification(params: {
        caseId: string;
        caseDepartmentId: string;
        requesterId: string;
    }): Promise<void>;
    static enqueueFeedbackCommentNotifications(params: {
        caseId: string;
        requesterId: string;
        commenterEmployeeId?: number | null;
        commenterName?: string | null;
        commentText?: string | null;
    }): Promise<void>;
}
//# sourceMappingURL=case-notification-service.d.ts.map