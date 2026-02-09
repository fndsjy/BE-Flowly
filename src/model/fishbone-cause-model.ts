import type { FishboneCause } from "../generated/flowly/client.js";

export type FishboneCauseResponse = {
  fishboneCauseId: string;
  fishboneId: string;
  causeNo: number;
  causeText: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FishboneCauseListResponse = FishboneCauseResponse;

export type CreateFishboneCauseRequest = {
  fishboneId: string;
  causeNo: number;
  causeText: string;
};

export type UpdateFishboneCauseRequest = {
  fishboneCauseId: string;
  causeNo?: number;
  causeText?: string;
  isActive?: boolean;
};

export type DeleteFishboneCauseRequest = {
  fishboneCauseId: string;
};

export function toFishboneCauseResponse(
  cause: FishboneCause
): FishboneCauseResponse {
  return {
    fishboneCauseId: cause.fishboneCauseId,
    fishboneId: cause.fishboneId,
    causeNo: cause.causeNo,
    causeText: cause.causeText,
    isActive: cause.isActive,
    isDeleted: cause.isDeleted,
    createdAt: cause.createdAt,
    updatedAt: cause.updatedAt,
  };
}

export const toFishboneCauseListResponse = toFishboneCauseResponse;
