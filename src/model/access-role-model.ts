export type AccessRoleResponse = {
  accessId: string;
  subjectType: string;
  subjectId: string;
  resourceType: string;
  masAccessId: string | null;
  resourceKey: string | null;
  accessLevel: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AccessRoleListResponse = AccessRoleResponse;

export type CreateAccessRoleRequest = {
  subjectType: string;
  subjectId: string;
  resourceType: string;
  masAccessId?: string | null;
  resourceKey?: string | null;
  accessLevel: string;
  isActive?: boolean;
};

export type UpdateAccessRoleRequest = {
  accessId: string;
  subjectType?: string;
  subjectId?: string;
  resourceType?: string;
  masAccessId?: string | null;
  resourceKey?: string | null;
  accessLevel?: string;
  isActive?: boolean;
};

export type DeleteAccessRoleRequest = {
  accessId: string;
};

export function toAccessRoleResponse(a: any): AccessRoleResponse {
  return {
    accessId: a.accessId,
    subjectType: a.subjectType,
    subjectId: a.subjectId,
    resourceType: a.resourceType,
    masAccessId: a.masAccessId ?? null,
    resourceKey: a.resourceKey ?? null,
    accessLevel: a.accessLevel,
    isActive: a.isActive ?? true,
    isDeleted: a.isDeleted ?? false,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export const toAccessRoleListResponse = toAccessRoleResponse;

export type AccessRoleSummaryItem = {
  resourceType: string;
  resourceKey: string;
  accessLevel: string;
};

export type OrgAccessSummary = {
  pilarRead: number[];
  pilarCrud: number[];
  sbuRead: number[];
  sbuCrud: number[];
  sbuSubRead: number[];
  sbuSubCrud: number[];
};

export type AccessRoleSummaryResponse = {
  isAdmin: boolean;
  menuAccess: AccessRoleSummaryItem[];
  moduleAccess: AccessRoleSummaryItem[];
  orgScope: {
    pilarRead: boolean;
    pilarCrud: boolean;
    sbuRead: boolean;
    sbuCrud: boolean;
    sbuSubRead: boolean;
    sbuSubCrud: boolean;
  };
  orgAccess: OrgAccessSummary;
};
