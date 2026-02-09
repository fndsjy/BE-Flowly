import type { MasterFishbone } from "../generated/flowly/client.js";

export type FishboneResponse = {
  fishboneId: string;
  sbuSubId: number;
  fishboneName: string;
  fishboneDesc: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FishboneListResponse = FishboneResponse;

export type CreateFishboneRequest = {
  sbuSubId: number;
  fishboneName: string;
  fishboneDesc?: string | null;
};

export type UpdateFishboneRequest = {
  fishboneId: string;
  sbuSubId?: number;
  fishboneName?: string;
  fishboneDesc?: string | null;
  isActive?: boolean;
};

export type DeleteFishboneRequest = {
  fishboneId: string;
};

export function toFishboneResponse(
  fishbone: MasterFishbone
): FishboneResponse {
  return {
    fishboneId: fishbone.fishboneId,
    sbuSubId: fishbone.sbuSubId,
    fishboneName: fishbone.fishboneName,
    fishboneDesc: fishbone.fishboneDesc ?? null,
    isActive: fishbone.isActive,
    isDeleted: fishbone.isDeleted,
    createdAt: fishbone.createdAt,
    updatedAt: fishbone.updatedAt,
  };
}

export const toFishboneListResponse = toFishboneResponse;
