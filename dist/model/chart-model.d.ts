import type { Chart } from "../generated/flowly/client.js";
export type ChartResponse = {
    chartId: string;
    parentId: string | null;
    pilarId: number;
    sbuId: number;
    sbuSubId: number;
    position: string;
    capacity: number;
    orderIndex: number;
    jobDesc: string | null;
};
export type CreateChartRequest = {
    parentId?: string | null;
    pilarId: number;
    sbuId: number;
    sbuSubId: number;
    position: string;
    capacity: number;
    orderIndex?: number;
    jobDesc?: string | null;
    jabatan?: string | null;
};
export type UpdateChartRequest = {
    chartId: string;
    position?: string;
    capacity?: number;
    orderIndex?: number;
    jobDesc?: string | null;
    jabatan?: string | null;
};
export type DeleteChartRequest = {
    chartId: string;
};
export type ChartListResponse = {
    chartId: string;
    parentId: string | null;
    pilarId: number;
    sbuId: number;
    sbuSubId: number;
    position: string;
    capacity: number;
    orderIndex: number;
    jobDesc: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare function toChartResponse(org: Chart): ChartResponse;
export declare function toChartListResponse(org: Chart): ChartListResponse;
//# sourceMappingURL=chart-model.d.ts.map