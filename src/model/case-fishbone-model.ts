import type { CaseFishboneMaster } from "../generated/flowly/client.js";

export type CaseFishboneResponse = {
  caseFishboneId: string;
  caseId: string;
  sbuSubId: number;
  fishboneName: string;
  fishboneDesc: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseFishboneListResponse = CaseFishboneResponse;

export type CreateCaseFishboneRequest = {
  caseId: string;
  sbuSubId: number;
  fishboneName: string;
  fishboneDesc?: string | null;
};

export type UpdateCaseFishboneRequest = {
  caseFishboneId: string;
  fishboneName?: string;
  fishboneDesc?: string | null;
  isActive?: boolean;
};

export type DeleteCaseFishboneRequest = {
  caseFishboneId: string;
};

export function toCaseFishboneResponse(
  fishbone: CaseFishboneMaster
): CaseFishboneResponse {
  return {
    caseFishboneId: fishbone.caseFishboneId,
    caseId: fishbone.caseId,
    sbuSubId: fishbone.sbuSubId,
    fishboneName: fishbone.fishboneName,
    fishboneDesc: fishbone.fishboneDesc ?? null,
    isActive: fishbone.isActive,
    isDeleted: fishbone.isDeleted,
    createdAt: fishbone.createdAt,
    updatedAt: fishbone.updatedAt,
  };
}

export const toCaseFishboneListResponse = toCaseFishboneResponse;
