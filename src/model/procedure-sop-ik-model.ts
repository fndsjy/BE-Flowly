import type {
  ProcedureSopIK,
  MasterIK,
  ProcedureSop,
} from "../generated/flowly/client.js";

export type ProcedureSopIkResponse = {
  sopIkId: string;
  sopId: string;
  ikId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sopName: string | null;
  sopNumber: string | null;
  ikName: string | null;
  ikNumber: string | null;
  ikEffectiveDate: Date | null;
  ikIsActive: boolean | null;
};

export type ProcedureSopIkListResponse = ProcedureSopIkResponse;

export type CreateProcedureSopIkRequest = {
  sopId: string;
  ikIds: string[];
};

export type UpdateProcedureSopIkRequest = {
  sopIkId: string;
  isActive?: boolean;
};

export type DeleteProcedureSopIkRequest = {
  sopIkId: string;
};

type ProcedureSopIkRecord = ProcedureSopIK & {
  masterIK?: Pick<
    MasterIK,
    "ikId" | "ikName" | "ikNumber" | "effectiveDate" | "isActive"
  > | null;
  sop?: Pick<ProcedureSop, "sopId" | "sopName" | "sopNumber"> | null;
};

export function toProcedureSopIkResponse(
  link: ProcedureSopIkRecord
): ProcedureSopIkResponse {
  return {
    sopIkId: link.sopIkId,
    sopId: link.sopId,
    ikId: link.ikId,
    isActive: link.isActive,
    isDeleted: link.isDeleted,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    sopName: link.sop?.sopName ?? null,
    sopNumber: link.sop?.sopNumber ?? null,
    ikName: link.masterIK?.ikName ?? null,
    ikNumber: link.masterIK?.ikNumber ?? null,
    ikEffectiveDate: link.masterIK?.effectiveDate ?? null,
    ikIsActive: link.masterIK?.isActive ?? null,
  };
}

export const toProcedureSopIkListResponse = toProcedureSopIkResponse;
