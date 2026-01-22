import type { ProcedureIk } from "../generated/flowly/client.js";

export type ProcedureIkResponse = {
  ikId: string;
  sopId: string;
  ikName: string;
  ikNumber: string;
  effectiveDate: Date;
  ikContent: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProcedureIkListResponse = ProcedureIkResponse;

export type CreateProcedureIkRequest = {
  sopId: string;
  ikName: string;
  ikNumber: string;
  effectiveDate: Date | string;
  ikContent?: string | null;
};

export type UpdateProcedureIkRequest = {
  ikId: string;
  ikName?: string;
  ikNumber?: string;
  effectiveDate?: Date | string;
  ikContent?: string | null;
  isActive?: boolean;
};

export type DeleteProcedureIkRequest = {
  ikId: string;
};

export function toProcedureIkResponse(ik: ProcedureIk): ProcedureIkResponse {
  return {
    ikId: ik.ikId,
    sopId: ik.sopId,
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

export const toProcedureIkListResponse = toProcedureIkResponse;
