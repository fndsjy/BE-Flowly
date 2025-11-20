// validation/orgchart-validation.ts
import { z, ZodType } from "zod";
export class OrgChartValidation {
    static CREATE = z.object({
        parentId: z.string().nullable().optional(),
        name: z.string().min(1, "Name is required"),
        position: z.string().min(1, "Position is required"),
        userId: z.string().nullable().optional(),
        orderIndex: z.number().optional(),
    });
    static UPDATE = z.object({
        nodeId: z.string().min(1, "Node ID is required"),
        parentId: z.string().nullable().optional(),
        name: z.string().min(1),
        position: z.string().min(1),
        userId: z.string().nullable().optional(),
        orderIndex: z.number().optional(),
    });
    static DELETE = z.object({
        nodeId: z.string().min(1),
    });
}
//# sourceMappingURL=orgchart-validation.js.map