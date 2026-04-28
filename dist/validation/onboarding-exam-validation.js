import { z, ZodType } from "zod";
const uniquePositiveIntegerArray = z
    .array(z.number().int().positive())
    .max(1000)
    .transform((value) => Array.from(new Set(value)));
const questionTypeOrder = z
    .array(z.enum(["MCQ", "ESSAY", "TRUE_FALSE", "POLLING"]))
    .min(1)
    .max(4)
    .transform((value) => Array.from(new Set(value)));
export class OnboardingExamValidation {
    static CREATE_ASSIGNMENT = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        examId: z.number().int().positive(),
        passScore: z.number().int().min(0).max(100).nullable().optional(),
        selectedQuestionIds: uniquePositiveIntegerArray.optional(),
        typeOrder: questionTypeOrder.optional(),
    });
    static UPDATE_STAGE_PASS_SCORE = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        passScore: z.number().int().min(0).max(100),
    });
    static UPDATE_STAGE_TYPE_ORDER = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        typeOrder: questionTypeOrder,
    });
    static DELETE_ASSIGNMENT = z.object({
        onboardingStageExamId: z.string().trim().min(1).max(100),
    });
}
//# sourceMappingURL=onboarding-exam-validation.js.map