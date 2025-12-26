// sbu-sub-validation.ts
import { z, ZodType } from "zod";
export class SbuSubValidation {
    static CREATE = z.object({
        sbuSubCode: z.string().min(1),
        sbuSubName: z.string().min(1),
        sbuId: z.number().min(1),
        sbuPilar: z.number().nullable().optional(),
        description: z.string().optional().nullable(),
        jobDesc: z.string().max(500).nullable().optional(),
        pic: z.number().nullable().optional().nullable(),
    });
    static UPDATE = z.object({
        id: z.number().min(1),
        sbuSubCode: z.string().optional(),
        sbuSubName: z.string().optional(),
        sbuId: z.number().optional(),
        sbuPilar: z.number().nullable().optional(),
        description: z.string().optional().nullable(),
        jobDesc: z.string().max(500).nullable().optional(),
        pic: z.number().nullable().optional().nullable(),
        status: z.string().optional(),
    });
    static DELETE = z.object({
        id: z.number().min(1),
    });
}
//# sourceMappingURL=sbu-sub-validation.js.map