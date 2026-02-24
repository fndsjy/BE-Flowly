import type { CaseFishboneCause } from "../generated/flowly/client.js";

export type CaseFishboneCauseResponse = {
  caseFishboneCauseId: string;
  caseFishboneId: string;
  causeNo: number;
  causeText: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseFishboneCauseListResponse = CaseFishboneCauseResponse;

export type CreateCaseFishboneCauseRequest = {
  caseFishboneId: string;
  causeNo: number;
  causeText: string;
};

export type UpdateCaseFishboneCauseRequest = {
  caseFishboneCauseId: string;
  causeNo?: number;
  causeText?: string;
  isActive?: boolean;
};

export type DeleteCaseFishboneCauseRequest = {
  caseFishboneCauseId: string;
};

export function toCaseFishboneCauseResponse(
  cause: CaseFishboneCause
): CaseFishboneCauseResponse {
  return {
    caseFishboneCauseId: cause.caseFishboneCauseId,
    caseFishboneId: cause.caseFishboneId,
    causeNo: cause.causeNo,
    causeText: cause.causeText,
    isActive: cause.isActive,
    isDeleted: cause.isDeleted,
    createdAt: cause.createdAt,
    updatedAt: cause.updatedAt,
  };
}

export const toCaseFishboneCauseListResponse = toCaseFishboneCauseResponse;
