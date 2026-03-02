import { z, ZodType } from "zod";
export class CaseFeedbackCommentValidation {
    static CREATE = z.object({
        caseId: z.string().min(1).max(20),
        commentText: z.string().min(1).max(1000),
    });
}
//# sourceMappingURL=case-feedback-comment-validation.js.map