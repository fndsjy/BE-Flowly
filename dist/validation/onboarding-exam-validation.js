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
const questionTypeDurations = z
    .object({
    MCQ: z.number().int().min(0).max(1440).optional(),
    ESSAY: z.number().int().min(0).max(1440).optional(),
    TRUE_FALSE: z.number().int().min(0).max(1440).optional(),
    POLLING: z.number().int().min(0).max(1440).optional(),
})
    .optional();
export class OnboardingExamValidation {
    static CREATE_ASSIGNMENT = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        examId: z.number().int().positive(),
        passScore: z.number().int().min(0).max(100).nullable().optional(),
        selectedQuestionIds: uniquePositiveIntegerArray.optional(),
        typeOrder: questionTypeOrder.optional(),
        typeDurations: questionTypeDurations,
    });
    static UPDATE_STAGE_PASS_SCORE = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        passScore: z.number().int().min(0).max(100),
    });
    static UPDATE_STAGE_TYPE_ORDER = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        typeOrder: questionTypeOrder,
    });
    static UPDATE_STAGE_TYPE_DURATIONS = z.object({
        onboardingStageTemplateId: z.string().trim().min(1).max(100),
        typeDurations: questionTypeDurations,
    });
    static DELETE_ASSIGNMENT = z.object({
        onboardingStageExamId: z.string().trim().min(1).max(100),
    });
}
//# sourceMappingURL=onboarding-exam-validation.js.map