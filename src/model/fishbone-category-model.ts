import type { FishboneCategory } from "../generated/flowly/client.js";

export type FishboneCategoryResponse = {
  fishboneCategoryId: string;
  categoryCode: string;
  categoryName: string;
  categoryDesc: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FishboneCategoryListResponse = FishboneCategoryResponse;

export type CreateFishboneCategoryRequest = {
  categoryCode: string;
  categoryName: string;
  categoryDesc?: string | null;
};

export type UpdateFishboneCategoryRequest = {
  fishboneCategoryId: string;
  categoryCode?: string;
  categoryName?: string;
  categoryDesc?: string | null;
  isActive?: boolean;
};

export type DeleteFishboneCategoryRequest = {
  fishboneCategoryId: string;
};

export function toFishboneCategoryResponse(
  category: FishboneCategory
): FishboneCategoryResponse {
  return {
    fishboneCategoryId: category.fishboneCategoryId,
    categoryCode: category.categoryCode,
    categoryName: category.categoryName,
    categoryDesc: category.categoryDesc ?? null,
    isActive: category.isActive,
    isDeleted: category.isDeleted,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export const toFishboneCategoryListResponse = toFishboneCategoryResponse;
