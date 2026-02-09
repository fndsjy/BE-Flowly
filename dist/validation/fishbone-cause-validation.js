import { z, ZodType } from "zod";
export class FishboneCauseValidation {
    static CREATE = z.object({
        fishboneId: z.string().min(1).max(20),
        causeNo: z.number().int().min(1),
        causeText: z.string().min(1).max(1000),
    });
    static UPDATE = z.object({
        fishboneCauseId: z.string().min(1).max(20),
        causeNo: z.number().int().min(1).optional(),
        causeText: z.string().max(1000).optional(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        fishboneCauseId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=fishbone-cause-validation.js.map