import { z, ZodType } from "zod";
export class SbuValidation {
    static CREATE = z.object({
        sbuCode: z.string().min(1),
        sbuName: z.string().min(1),
        sbuPilar: z.number().min(1),
        description: z.string().optional().nullable(),
        jobDesc: z.string().max(500).nullable().optional(),
        pic: z.number().nullable().optional().nullable(),
    });
    static UPDATE = z.object({
        id: z.number().min(1),
        sbuCode: z.string().optional(),
        sbuName: z.string().optional(),
        sbuPilar: z.number().optional(),
        description: z.string().optional().nullable(),
        jobDesc: z.string().max(500).nullable().optional(),
        pic: z.number().nullable().optional().nullable(),
        status: z.string().optional(),
    });
    static DELETE = z.object({
        id: z.number().min(1),
    });
}
//# sourceMappingURL=sbu-validation.js.map