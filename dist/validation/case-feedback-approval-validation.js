import { z, ZodType } from "zod";
export class CaseFeedbackApprovalValidation {
    static APPROVE = z.object({
        caseId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=case-feedback-approval-validation.js.map