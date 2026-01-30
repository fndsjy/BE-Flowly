import type { MasterIK } from "../generated/flowly/client.js";

export type MasterIkResponse = {
  ikId: string;
  ikName: string;
  ikNumber: string;
  effectiveDate: Date;
  ikContent: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterIkListResponse = MasterIkResponse;

export type CreateMasterIkRequest = {
  ikName: string;
  ikNumber: string;
  effectiveDate: Date | string;
  ikContent?: string | null;
};

export type UpdateMasterIkRequest = {
  ikId: string;
  ikName?: string;
  ikNumber?: string;
  effectiveDate?: Date | string;
  ikContent?: string | null;
  isActive?: boolean;
};

export type DeleteMasterIkRequest = {
  ikId: string;
};

export function toMasterIkResponse(ik: MasterIK): MasterIkResponse {
  return {
    ikId: ik.ikId,
    ikName: ik.ikName,
    ikNumber: ik.ikNumber,
    effectiveDate: ik.effectiveDate,
    ikContent: ik.ikContent ?? null,
    isActive: ik.isActive,
    isDeleted: ik.isDeleted,
    createdAt: ik.createdAt,
    updatedAt: ik.updatedAt,
  };
}

export const toMasterIkListResponse = toMasterIkResponse;
