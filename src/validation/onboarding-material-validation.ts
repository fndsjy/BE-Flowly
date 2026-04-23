import { z, ZodType } from "zod";

const uniquePositiveIntegerArray = z
  .array(z.number().int().positive())
  .max(500)
  .transform((value) => Array.from(new Set(value)));

export class OnboardingMaterialValidation {
  static readonly CREATE_ASSIGNMENT: ZodType = z.object({
    onboardingStageTemplateId: z.string().trim().min(1).max(100),
    materiId: z.number().int().positive(),
    selectedFileIds: uniquePositiveIntegerArray.optional(),
    isRequired: z.boolean().optional(),
  });

  static readonly DELETE_ASSIGNMENT: ZodType = z.object({
    onboardingStageMaterialId: z.string().trim().min(1).max(100),
  });
}
