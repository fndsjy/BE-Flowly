import type { ProcedureSop } from "../generated/flowly/client.js";

export type ProcedureSopResponse = {
  sopId: string;
  sbuSubId: number;
  sbuId: number | null;
  pilarId: number | null;
  sopName: string;
  sopNumber: string;
  effectiveDate: Date;
  filePath: string;
  fileName: string;
  fileMime: string | null;
  fileSize: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProcedureSopListResponse = ProcedureSopResponse;

export type CreateProcedureSopRequest = {
  sbuSubId: number;
  sopName: string;
  sopNumber: string;
  effectiveDate: Date | string;
  filePath: string;
  fileName: string;
  fileMime?: string | null;
  fileSize?: number | null;
};

export type UpdateProcedureSopRequest = {
  sopId: string;
  sopName?: string;
  sopNumber?: string;
  effectiveDate?: Date | string;
  filePath?: string;
  fileName?: string;
  fileMime?: string | null;
  fileSize?: number | null;
  isActive?: boolean;
};

export type DeleteProcedureSopRequest = {
  sopId: string;
};

export function toProcedureSopResponse(sop: ProcedureSop): ProcedureSopResponse {
  return {
    sopId: sop.sopId,
    sbuSubId: sop.sbuSubId,
    sbuId: sop.sbuId ?? null,
    pilarId: sop.pilarId ?? null,
    sopName: sop.sopName,
    sopNumber: sop.sopNumber,
    effectiveDate: sop.effectiveDate,
    filePath: sop.filePath,
    fileName: sop.fileName,
    fileMime: sop.fileMime ?? null,
    fileSize: sop.fileSize ?? null,
    isActive: sop.isActive,
    isDeleted: sop.isDeleted,
    createdAt: sop.createdAt,
    updatedAt: sop.updatedAt,
  };
}

export const toProcedureSopListResponse = toProcedureSopResponse;
