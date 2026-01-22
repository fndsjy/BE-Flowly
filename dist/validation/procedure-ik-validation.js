import { z, ZodType } from "zod";
export class ProcedureIkValidation {
    static CREATE = z.object({
        sopId: z.string().min(1).max(20),
        ikName: z.string().min(1).max(150),
        ikNumber: z.string().min(1).max(50),
        effectiveDate: z.coerce.date(),
        ikContent: z.string().optional().nullable(),
    });
    static UPDATE = z.object({
        ikId: z.string().min(1).max(20),
        ikName: z.string().max(150).optional(),
        ikNumber: z.string().max(50).optional(),
        effectiveDate: z.coerce.date().optional(),
        ikContent: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        ikId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=procedure-ik-validation.js.map