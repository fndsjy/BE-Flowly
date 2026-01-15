import type { CreateChartRequest, UpdateChartRequest, DeleteChartRequest } from "../model/chart-model.js";
export declare class ChartService {
    static create(requesterUserId: string, request: CreateChartRequest): Promise<import("../model/chart-model.js").ChartResponse>;
    static update(requesterUserId: string, request: UpdateChartRequest): Promise<import("../model/chart-model.js").ChartResponse>;
    static softDelete(requesterUserId: string, request: DeleteChartRequest): Promise<{
        message: string;
    }>;
    static listTree(): Promise<import("../model/chart-model.js").ChartListResponse[]>;
    static listBySbuSub(requesterId: string, pilarId?: number, sbuId?: number, sbuSubId?: number): Promise<import("../model/chart-model.js").ChartListResponse[]>;
}
//# sourceMappingURL=chart-service.d.ts.map