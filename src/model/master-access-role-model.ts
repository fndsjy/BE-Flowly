export type MasterAccessRoleResponse = {
  masAccessId: string;
  resourceType: string;
  resourceKey: string;
  displayName: string;
  route: string | null;
  parentKey: string | null;
  orderIndex: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterAccessRoleListResponse = MasterAccessRoleResponse;

export type CreateMasterAccessRoleRequest = {
  resourceType: string;
  resourceKey: string;
  displayName: string;
  route?: string | null;
  parentKey?: string | null;
  orderIndex?: number;
  isActive?: boolean;
};

export type UpdateMasterAccessRoleRequest = {
  masAccessId: string;
  resourceType?: string;
  resourceKey?: string;
  displayName?: string;
  route?: string | null;
  parentKey?: string | null;
  orderIndex?: number;
  isActive?: boolean;
};

export type DeleteMasterAccessRoleRequest = {
  masAccessId: string;
};

export function toMasterAccessRoleResponse(m: any): MasterAccessRoleResponse {
  return {
    masAccessId: m.masAccessId,
    resourceType: m.resourceType,
    resourceKey: m.resourceKey,
    displayName: m.displayName,
    route: m.route ?? null,
    parentKey: m.parentKey ?? null,
    orderIndex: m.orderIndex ?? 0,
    isActive: m.isActive ?? true,
    isDeleted: m.isDeleted ?? false,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export const toMasterAccessRoleListResponse = toMasterAccessRoleResponse;
