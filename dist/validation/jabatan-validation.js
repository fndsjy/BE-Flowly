import { z, ZodType } from "zod";
export class JabatanValidation {
    static CREATE = z.object({
        jabatanName: z.string().min(1).max(100),
        jabatanLevel: z.number().int().positive().optional(),
        jabatanDesc: z.string().max(255).optional().nullable(),
        jabatanIsActive: z.boolean().optional(),
    });
    static UPDATE = z.object({
        jabatanId: z.string().min(1).max(20),
        jabatanName: z.string().min(1).max(100).optional(),
        jabatanLevel: z.number().int().positive().optional(),
        jabatanDesc: z.string().max(255).optional().nullable(),
        jabatanIsActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        jabatanId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=jabatan-validation.js.map