import { z, ZodType } from "zod";
export class OnboardingMaterialAssignmentValidation {
    static LIST = z.object({
        portalKey: z.string().max(50).optional(),
        stageNumber: z.coerce.number().int().min(1).max(10).optional(),
        q: z.string().max(200).optional(),
        includeFiles: z.coerce.boolean().optional(),
    });
}
//# sourceMappingURL=onboarding-material-assignment-validation.js.map