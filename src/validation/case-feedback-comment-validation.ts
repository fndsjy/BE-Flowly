import { z, ZodType } from "zod";

export class CaseFeedbackCommentValidation {
  static readonly CREATE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
    commentText: z.string().min(1).max(1000),
  });
}
