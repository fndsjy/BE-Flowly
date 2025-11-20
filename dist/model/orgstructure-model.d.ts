import type { OrgStructure } from "@prisma/client";
export type OrgStructureResponse = {
    structureId: string;
    name: string;
    description: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type OrgStructureListResponse = {
    structureId: string;
    name: string;
    description: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CreateOrgStructureRequest = {
    name: string;
    description?: string | null;
};
export type UpdateOrgStructureRequest = {
    structureId: string;
    name?: string;
    description?: string | null;
};
export type DeleteOrgStructureRequest = {
    structureId: string;
};
export declare function toOrgStructureResponse(s: OrgStructure): OrgStructureResponse;
export declare function toOrgStructureListResponse(s: OrgStructure): OrgStructureListResponse;
//# sourceMappingURL=orgstructure-model.d.ts.map