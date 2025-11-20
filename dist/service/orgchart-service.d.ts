import type { CreateOrgChartRequest, UpdateOrgChartRequest, DeleteOrgChartRequest } from "../model/orgchart-model.js";
export declare class OrgChartService {
    static create(requesterUserId: string, request: CreateOrgChartRequest): Promise<import("../model/orgchart-model.js").OrgChartResponse>;
    static update(requesterUserId: string, request: UpdateOrgChartRequest): Promise<import("../model/orgchart-model.js").OrgChartResponse>;
    static softDelete(requesterUserId: string, request: DeleteOrgChartRequest): Promise<{
        message: string;
    }>;
    static listTree(): Promise<import("../model/orgchart-model.js").OrgChartListResponse[]>;
}
//# sourceMappingURL=orgchart-service.d.ts.map