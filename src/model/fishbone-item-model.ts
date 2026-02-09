import type {
  FishboneItem,
  FishboneItemCause,
  FishboneCause,
} from "../generated/flowly/client.js";

export type FishboneItemCauseInfo = {
  fishboneCauseId: string;
  causeNo: number;
  causeText: string;
  isActive: boolean;
  isDeleted: boolean;
};

export type FishboneItemResponse = {
  fishboneItemId: string;
  fishboneId: string;
  categoryCode: string;
  problemText: string;
  solutionText: string;
  causes: FishboneItemCauseInfo[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FishboneItemListResponse = FishboneItemResponse;

export type CreateFishboneItemRequest = {
  fishboneId: string;
  categoryCode: string;
  problemText: string;
  solutionText: string;
  causeIds: string[];
};

export type UpdateFishboneItemRequest = {
  fishboneItemId: string;
  categoryCode?: string;
  problemText?: string;
  solutionText?: string;
  isActive?: boolean;
  causeIds?: string[];
};

export type DeleteFishboneItemRequest = {
  fishboneItemId: string;
};

type FishboneCauseLite = Pick<
  FishboneCause,
  "fishboneCauseId" | "causeNo" | "causeText" | "isActive" | "isDeleted"
>;

type FishboneItemRecord = FishboneItem & {
  causeLinks?: Array<
    FishboneItemCause & {
      cause?: FishboneCauseLite | null;
    }
  >;
};

export function toFishboneItemResponse(
  item: FishboneItemRecord
): FishboneItemResponse {
  const causes = (item.causeLinks ?? [])
    .map((link) => link.cause)
    .filter((cause): cause is FishboneCauseLite => Boolean(cause))
    .map((cause) => ({
      fishboneCauseId: cause.fishboneCauseId,
      causeNo: cause.causeNo,
      causeText: cause.causeText,
      isActive: cause.isActive,
      isDeleted: cause.isDeleted,
    }))
    .sort((a, b) => a.causeNo - b.causeNo);

  return {
    fishboneItemId: item.fishboneItemId,
    fishboneId: item.fishboneId,
    categoryCode: item.categoryCode,
    problemText: item.problemText,
    solutionText: item.solutionText,
    causes,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const toFishboneItemListResponse = toFishboneItemResponse;
