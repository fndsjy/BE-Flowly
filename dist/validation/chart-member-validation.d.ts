import { z } from "zod";
export declare class ChartMemberValidation {
    static readonly CREATE: z.ZodObject<{
        chartId: z.ZodString;
        userId: z.ZodNumber;
    }, z.core.$strip>;
    static readonly UPDATE: z.ZodObject<{
        memberChartId: z.ZodString;
        userId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    static readonly DELETE: z.ZodObject<{
        memberChartId: z.ZodString;
    }, z.core.$strip>;
}
//# sourceMappingURL=chart-member-validation.d.ts.map