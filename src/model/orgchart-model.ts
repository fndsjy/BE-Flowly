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
  position?: string;
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

// Helper untuk respons create/update
export function toOrgChartResponse(org: OrgChart): OrgChartResponse {
  return {
    nodeId: org.nodeId,
    parentId: org.parentId,
    structureId: org.structureId,
    name: org.name,
    position: org.position,
    orderIndex: org.orderIndex,
    userId: org.userId,
  };
}

// Helper untuk list tree
export function toOrgChartListResponse(org: OrgChart): OrgChartListResponse {
  return {
    nodeId: org.nodeId,
    parentId: org.parentId,
    structureId: org.structureId,
    name: org.name ?? "",
    position: org.position,
    orderIndex: org.orderIndex,
    userId: org.userId,
    isDeleted: org.isDeleted,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}
