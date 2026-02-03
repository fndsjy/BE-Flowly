import { z, ZodType } from "zod";
const IdSchema = z.string().min(1).max(20);
export class ProcedureSopIkValidation {
    static CREATE = z.object({
        sopId: IdSchema,
        ikIds: z.array(IdSchema).min(1),
    });
    static UPDATE = z.object({
        sopIkId: IdSchema,
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        sopIkId: IdSchema,
    });
}
//# sourceMappingURL=procedure-sop-ik-validation.js.map