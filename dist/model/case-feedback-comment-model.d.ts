export type CaseFeedbackCommentResponse = {
    caseFeedbackCommentId: string;
    caseId: string;
    commentText: string;
    commenterName: string;
    commenterType: string | null;
    commenterId: string | null;
    commenterEmployeeId: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseFeedbackCommentListResponse = CaseFeedbackCommentResponse;
export type CreateCaseFeedbackCommentRequest = {
    caseId: string;
    commentText: string;
};
type CaseFeedbackCommentEntity = {
    caseFeedbackCommentId: string;
    caseId: string;
    commentText: string;
    commenterName: string;
    commenterType?: string | null;
    commenterId?: string | null;
    commenterEmployeeId?: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare function toCaseFeedbackCommentResponse(comment: CaseFeedbackCommentEntity): CaseFeedbackCommentResponse;
export declare const toCaseFeedbackCommentListResponse: typeof toCaseFeedbackCommentResponse;
export {};
//# sourceMappingURL=case-feedback-comment-model.d.ts.map