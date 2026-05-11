import { z, ZodType } from "zod";

const PROGRAM_TYPES = ["ONBOARDING", "LEARNING"] as const;
const programTypeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => PROGRAM_TYPES.includes(value as (typeof PROGRAM_TYPES)[number]), {
    message: "Jenis program tahap harus ONBOARDING atau LEARNING",
  })
  .nullable()
  .optional();

export class OnboardingStageValidation {
  static readonly CREATE_STAGE: ZodType = z.object({
    onboardingPortalTemplateId: z.string().trim().min(1).max(100),
    programType: programTypeSchema,
    stageName: z.string().trim().min(1).max(100),
    stageDescription: z.string().trim().max(1000).nullable().optional(),
  });

  static readonly UPDATE_STAGE: ZodType = z
    .object({
      onboardingStageTemplateId: z.string().trim().min(1).max(100),
      stageName: z.string().trim().min(1).max(100).optional(),
      stageDescription: z.string().trim().max(1000).nullable().optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (value) =>
        value.stageName !== undefined ||
        value.stageDescription !== undefined ||
        value.isActive !== undefined,
      {
        message: "Minimal satu field tahap harus diubah",
      }
    );

  static readonly DELETE_STAGE: ZodType = z.object({
    onboardingStageTemplateId: z.string().trim().min(1).max(100),
  });
}
