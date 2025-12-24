import { z, ZodType } from "zod";
export class ChartValidation {
    static CREATE = z.object({
        parentId: z.string().nullable().optional(),
        pilarId: z.number().min(0, "pilarId is required"),
        sbuId: z.number().min(0, "sbuId is required"),
        sbuSubId: z.number().min(0, "sbuSubId is required"),
        position: z.string().min(1, "Position is required"),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        orderIndex: z.number().optional(),
        jobDesc: z.string().max(500).nullable().optional(),
    });
    static UPDATE = z.object({
        chartId: z.string().min(1, "Node ID is required"),
        position: z.string().optional(),
        capacity: z.number().int().min(1).optional(),
        orderIndex: z.number().optional(),
        jobDesc: z.string().max(500).nullable().optional(),
    });
    static DELETE = z.object({
        chartId: z.string().min(1),
    });
}
//# sourceMappingURL=chart-validation.js.map