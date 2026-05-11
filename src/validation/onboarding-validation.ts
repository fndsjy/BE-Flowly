import { z, ZodType } from "zod";

const optionalDate = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  },
  z.coerce.date().optional()
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z
      .string()
      .trim()
      .max(max)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined))
  );

export class OnboardingValidation {
  static readonly START_EMPLOYEE: ZodType = z.object({
    portalKey: z.string().trim().min(1).max(50).optional(),
    userIds: z
      .array(z.number().int().positive())
      .min(1, "Pilih minimal satu karyawan")
      .max(200, "Maksimal 200 karyawan per request")
      .transform((value) => Array.from(new Set(value))),
    startedAt: optionalDate,
    durationDay: z.number().int().positive().max(3650).optional().nullable(),
    note: optionalText(1000).optional(),
  });

  static readonly LIST_EMPLOYEE_SUMMARY: ZodType = z.object({
    portalKey: z.string().trim().min(1).max(50).optional(),
  });

  static readonly START_MATERIAL_READ: ZodType = z.object({
    onboardingAssignmentId: z.string().trim().min(1).max(100),
    onboardingStageProgressId: z.string().trim().min(1).max(100),
    onboardingStageMaterialId: z.string().trim().min(1).max(100),
    sourceFileId: z.number().int().nonnegative().optional().nullable(),
    fileName: optionalText(255).optional(),
    fileTitle: optionalText(255).optional(),
  });

  static readonly DECIDE_ONBOARDING: ZodType = z
    .object({
      onboardingAssignmentId: z.string().trim().min(1).max(100),
      decisionType: z
        .string()
        .trim()
        .transform((value) => value.toUpperCase())
        .refine(
          (value) =>
              value === "PASS_OVERRIDE" ||
              value === "EXTEND" ||
              value === "FAIL_FINAL" ||
              value === "FREEZE_TRANSFER_REVIEW" ||
              value === "CANCEL_TRANSFER_REVIEW",
          {
            message: "Keputusan onboarding tidak valid",
          }
        ),
      nextDurationDay: z.number().int().positive().max(3650).optional().nullable(),
      note: optionalText(2000).optional(),
    })
    .superRefine((value, ctx) => {
      if (value.decisionType === "FAIL_FINAL" && !value.note) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["note"],
          message:
            "Alasan wajib diisi ketika PIC ingin menetapkan bawahan gagal onboarding final",
        });
      }
    });
}
