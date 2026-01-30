import { z, ZodType } from "zod";
export class ProcedureSopValidation {
    static CREATE = z.object({
        sbuSubId: z.number().int().min(1),
        sopName: z.string().min(1).max(150),
        sopNumber: z.string().min(1).max(50),
        effectiveDate: z.coerce.date(),
        fileData: z.string().min(1),
        fileOriginalName: z.string().max(255).optional(),
    });
    static UPDATE = z.object({
        sopId: z.string().min(1).max(20),
        sopName: z.string().max(150).optional(),
        sopNumber: z.string().max(50).optional(),
        effectiveDate: z.coerce.date().optional(),
        isActive: z.boolean().optional(),
        fileData: z.string().min(1).optional(),
        fileOriginalName: z.string().max(255).optional(),
    });
    static DELETE = z.object({
        sopId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=procedure-sop-validation.js.map