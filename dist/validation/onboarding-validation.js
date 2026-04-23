import { z, ZodType } from "zod";
const optionalDate = z.preprocess((value) => {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
        return undefined;
    }
    return value;
}, z.coerce.date().optional());
const optionalText = (max) => z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));
export class OnboardingValidation {
    static START_EMPLOYEE = z.object({
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
    static LIST_EMPLOYEE_SUMMARY = z.object({
        portalKey: z.string().trim().min(1).max(50).optional(),
    });
    static START_MATERIAL_READ = z.object({
        onboardingAssignmentId: z.string().trim().min(1).max(100),
        onboardingStageProgressId: z.string().trim().min(1).max(100),
        onboardingStageMaterialId: z.string().trim().min(1).max(100),
        sourceFileId: z.number().int().nonnegative().optional().nullable(),
        fileName: optionalText(255).optional(),
        fileTitle: optionalText(255).optional(),
    });
}
//# sourceMappingURL=onboarding-validation.js.map