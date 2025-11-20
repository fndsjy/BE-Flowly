import type { OrgChart } from "@prisma/client";
export type OrgChartResponse = {
    nodeId: string;
    parentId: string | null;
    structureId: string;
    name: string | null;
    position: string;
    orderIndex: number;
    userId: string | null;
};
export type CreateOrgChartRequest = {
    parentId?: string | null;
    structureId: string;
    name?: string;
    position: string;
    userId?: string | null;
    orderIndex?: number;
};
export type UpdateOrgChartRequest = {
    nodeId: string;
    parentId?: string | null;
    structureId?: string;
    name?: string;
    position: string;
    userId?: string | null;
    orderIndex?: number;
};
export type DeleteOrgChartRequest = {
    nodeId: string;
};
export type OrgChartListResponse = {
    nodeId: string;
    parentId: string | null;
    structureId: string;
    name: string;
    position: string;
    orderIndex: number;
    userId: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare function toOrgChartResponse(org: OrgChart): OrgChartResponse;
export declare function toOrgChartListResponse(org: OrgChart): OrgChartListResponse;
//# sourceMappingURL=orgchart-model.d.ts.map