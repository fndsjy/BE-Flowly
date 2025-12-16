export type ChartMemberResponse = {
    memberChartId: string;
    chartId: string;
    userId: number | null;
};
export type CreateChartMemberRequest = {
    chartId: string;
    userId: number;
};
export type UpdateChartMemberRequest = {
    memberChartId: string;
    userId?: number;
};
export type DeleteChartMemberRequest = {
    memberChartId: string;
};
export declare function toChartMemberResponse(m: any): ChartMemberResponse;
//# sourceMappingURL=chart-member-model.d.ts.map