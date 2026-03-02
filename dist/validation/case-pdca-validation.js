import { z, ZodType } from "zod";
const dateSchema = z.union([z.string(), z.date()]);
export class CasePdcaValidation {
    static CREATE = z.object({
        caseId: z.string().min(1).max(20),
        itemNo: z.number().int().min(1).optional(),
        planText: z.string().max(1000).optional().nullable(),
        doText: z.string().max(1000).optional().nullable(),
        doStartDate: dateSchema.optional().nullable(),
        doEndDate: dateSchema.optional().nullable(),
        checkText: z.string().max(1000).optional().nullable(),
        checkStartDate: dateSchema.optional().nullable(),
        checkEndDate: dateSchema.optional().nullable(),
        checkBy: z.string().max(100).optional().nullable(),
        checkComment: z.string().max(500).optional().nullable(),
        actText: z.string().max(2000).optional().nullable(),
        actStartDate: dateSchema.optional().nullable(),
        actEndDate: dateSchema.optional().nullable(),
    });
    static UPDATE = z.object({
        casePdcaItemId: z.string().min(1).max(20),
        itemNo: z.number().int().min(1).optional(),
        planText: z.string().max(1000).optional().nullable(),
        doText: z.string().max(1000).optional().nullable(),
        doStartDate: dateSchema.optional().nullable(),
        doEndDate: dateSchema.optional().nullable(),
        checkText: z.string().max(1000).optional().nullable(),
        checkStartDate: dateSchema.optional().nullable(),
        checkEndDate: dateSchema.optional().nullable(),
        checkBy: z.string().max(100).optional().nullable(),
        checkComment: z.string().max(500).optional().nullable(),
        actText: z.string().max(2000).optional().nullable(),
        actStartDate: dateSchema.optional().nullable(),
        actEndDate: dateSchema.optional().nullable(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        casePdcaItemId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=case-pdca-validation.js.map