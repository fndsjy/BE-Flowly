import { z, ZodType } from "zod";
export class ProcedureSopValidation {
    static CREATE = z.object({
        sbuSubId: z.number().int().min(1),
        sopName: z.string().min(1).max(150),
        sopNumber: z.string().min(1).max(50),
        effectiveDate: z.coerce.date(),
        filePath: z.string().min(1).max(500),
        fileName: z.string().min(1).max(255),
        fileMime: z.string().max(100).optional().nullable(),
        fileSize: z.number().int().positive().optional().nullable(),
    });
    static UPDATE = z.object({
        sopId: z.string().min(1).max(20),
        sopName: z.string().max(150).optional(),
        sopNumber: z.string().max(50).optional(),
        effectiveDate: z.coerce.date().optional(),
        filePath: z.string().max(500).optional(),
        fileName: z.string().max(255).optional(),
        fileMime: z.string().max(100).optional().nullable(),
        fileSize: z.number().int().positive().optional().nullable(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        sopId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=procedure-sop-validation.js.map