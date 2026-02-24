import type { CaseHeader } from "../generated/flowly/client.js";

export type CaseHeaderResponse = {
  caseId: string;
  caseType: string;
  caseTitle: string;
  background: string | null;
  currentCondition: string | null;
  projectDesc: string | null;
  projectObjective: string | null;
  locationDesc: string | null;
  notes: string | null;
  status: string;
  requesterId: string | null;
  requesterEmployeeId: number | null;
  originSbuSubId: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseHeaderListResponse = CaseHeaderResponse;

export type CreateCaseHeaderRequest = {
  caseType: string;
  caseTitle: string;
  background?: string | null;
  currentCondition?: string | null;
  projectDesc?: string | null;
  projectObjective?: string | null;
  locationDesc?: string | null;
  notes?: string | null;
  originSbuSubId?: number;
  departmentSbuSubIds: number[];
};

export type UpdateCaseHeaderRequest = {
  caseId: string;
  caseType?: string;
  caseTitle?: string;
  background?: string | null;
  currentCondition?: string | null;
  projectDesc?: string | null;
  projectObjective?: string | null;
  locationDesc?: string | null;
  notes?: string | null;
  status?: string;
  originSbuSubId?: number | null;
  isActive?: boolean;
};

export type DeleteCaseHeaderRequest = {
  caseId: string;
};

export function toCaseHeaderResponse(caseHeader: CaseHeader): CaseHeaderResponse {
  return {
    caseId: caseHeader.caseId,
    caseType: caseHeader.caseType,
    caseTitle: caseHeader.caseTitle,
    background: caseHeader.background ?? null,
    currentCondition: caseHeader.currentCondition ?? null,
    projectDesc: (caseHeader as CaseHeader & { projectDesc?: string | null }).projectDesc ?? null,
    projectObjective:
      (caseHeader as CaseHeader & { projectObjective?: string | null })
        .projectObjective ?? null,
    locationDesc: caseHeader.locationDesc ?? null,
    notes: caseHeader.notes ?? null,
    status: caseHeader.status,
    requesterId: caseHeader.requesterId ?? null,
    requesterEmployeeId: caseHeader.requesterEmployeeId ?? null,
    originSbuSubId: caseHeader.originSbuSubId ?? null,
    isActive: caseHeader.isActive,
    isDeleted: caseHeader.isDeleted,
    createdAt: caseHeader.createdAt,
    updatedAt: caseHeader.updatedAt,
  };
}

export const toCaseHeaderListResponse = toCaseHeaderResponse;
