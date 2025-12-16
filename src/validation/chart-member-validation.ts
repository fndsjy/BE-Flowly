import { z } from "zod";


export class ChartMemberValidation {
    static readonly CREATE = z.object({
        chartId: z.string().min(1, "chartId is required"),
        userId: z.number().min(1, "userId is required"),
    });


    static readonly UPDATE = z.object({
        memberChartId: z.string().min(1, "memberChartId is required"),
        userId: z.number().optional(),
    });


    static readonly DELETE = z.object({
        memberChartId: z.string().min(1),
    });
}