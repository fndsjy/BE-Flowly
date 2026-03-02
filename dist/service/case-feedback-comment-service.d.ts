import { type CreateCaseFeedbackCommentRequest } from "../model/case-feedback-comment-model.js";
export declare class CaseFeedbackCommentService {
    static create(requesterId: string, reqBody: CreateCaseFeedbackCommentRequest): Promise<import("../model/case-feedback-comment-model.js").CaseFeedbackCommentResponse>;
    static list(requesterId: string, filters?: {
        caseId?: string;
    }): Promise<import("../model/case-feedback-comment-model.js").CaseFeedbackCommentResponse[]>;
}
//# sourceMappingURL=case-feedback-comment-service.d.ts.map