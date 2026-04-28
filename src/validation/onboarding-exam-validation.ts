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
  static readonly CREATE_ASSIGNMENT: ZodType = z.object({
    onboardingStageTemplateId: z.string().trim().min(1).max(100),
    examId: z.number().int().positive(),
    passScore: z.number().int().min(0).max(100).nullable().optional(),
    selectedQuestionIds: uniquePositiveIntegerArray.optional(),
    typeOrder: questionTypeOrder.optional(),
  });

  static readonly UPDATE_STAGE_PASS_SCORE: ZodType = z.object({
    onboardingStageTemplateId: z.string().trim().min(1).max(100),
    passScore: z.number().int().min(0).max(100),
  });

  static readonly UPDATE_STAGE_TYPE_ORDER: ZodType = z.object({
    onboardingStageTemplateId: z.string().trim().min(1).max(100),
    typeOrder: questionTypeOrder,
  });

  static readonly DELETE_ASSIGNMENT: ZodType = z.object({
    onboardingStageExamId: z.string().trim().min(1).max(100),
  });
}
