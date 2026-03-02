import { z, ZodType } from "zod";

export class CaseFeedbackApprovalValidation {
  static readonly APPROVE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
  });
}
