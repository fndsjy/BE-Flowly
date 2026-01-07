export type ChartMemberResponse = {
    memberChartId: string;
    chartId: string;
    userId: number | null;
    jabatan: string | null;
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


export function toChartMemberResponse(m: any): ChartMemberResponse {
    return {
        memberChartId: m.memberChartId,
        chartId: m.chartId,
        userId: m.userId,
        jabatan: m.jabatan ?? null,
    };
}
