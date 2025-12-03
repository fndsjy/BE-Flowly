import type { OrgStructure } from "../generated/flowly/client.js";

/* ------------------ RESPONSE TYPE ------------------ */
export type OrgStructureResponse = {
  structureId: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------ LIST TYPE (FOR TABLE / DROPDOWN) ------------------ */
export type OrgStructureListResponse = {
  structureId: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------ REQUEST TYPE ------------------ */
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

/* ------------------ HELPERS ------------------ */

// Single response
export function toOrgStructureResponse(s: OrgStructure): OrgStructureResponse {
  return {
    structureId: s.structureId,
    name: s.name,
    description: s.description,
    isDeleted: s.isDeleted,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

// List response (untuk list view)
export function toOrgStructureListResponse(s: OrgStructure): OrgStructureListResponse {
  return {
    structureId: s.structureId,
    name: s.name,
    description: s.description,
    isDeleted: s.isDeleted,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
