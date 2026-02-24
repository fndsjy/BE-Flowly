import { z, ZodType } from "zod";
export class CaseFishboneValidation {
    static CREATE = z.object({
        caseId: z.string().min(1).max(20),
        sbuSubId: z.number().int().min(1),
        fishboneName: z.string().min(1).max(150),
        fishboneDesc: z.string().max(1000).optional().nullable(),
    });
    static UPDATE = z.object({
        caseFishboneId: z.string().min(1).max(20),
        fishboneName: z.string().max(150).optional(),
        fishboneDesc: z.string().max(1000).optional().nullable(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        caseFishboneId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=case-fishbone-validation.js.map