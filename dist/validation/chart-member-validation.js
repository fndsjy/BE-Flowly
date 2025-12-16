import { z } from "zod";
export class ChartMemberValidation {
    static CREATE = z.object({
        chartId: z.string().min(1, "chartId is required"),
        userId: z.number().min(1, "userId is required"),
    });
    static UPDATE = z.object({
        memberChartId: z.string().min(1, "memberChartId is required"),
        userId: z.number().optional(),
    });
    static DELETE = z.object({
        memberChartId: z.string().min(1),
    });
}
//# sourceMappingURL=chart-member-validation.js.map