export declare class ChartMemberService {
    static update(requesterUserId: string, request: any): Promise<import("../model/chart-member-model.js").ChartMemberResponse>;
    static softDelete(requesterUserId: string, request: any): Promise<{
        message: string;
    }>;
    static listByChart(chartId: string): Promise<import("../model/chart-member-model.js").ChartMemberResponse[]>;
}
//# sourceMappingURL=chart-member-service.d.ts.map