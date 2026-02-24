import type {
  CaseFishboneItem,
  CaseFishboneItemCause,
  CaseFishboneCause,
} from "../generated/flowly/client.js";

export type CaseFishboneItemCauseInfo = {
  caseFishboneCauseId: string;
  causeNo: number;
  causeText: string;
  isActive: boolean;
  isDeleted: boolean;
};

export type CaseFishboneItemResponse = {
  caseFishboneItemId: string;
  caseFishboneId: string;
  categoryCode: string;
  problemText: string;
  solutionText: string;
  causes: CaseFishboneItemCauseInfo[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseFishboneItemListResponse = CaseFishboneItemResponse;

export type CreateCaseFishboneItemRequest = {
  caseFishboneId: string;
  categoryCode: string;
  problemText: string;
  solutionText: string;
  causeIds: string[];
};

export type UpdateCaseFishboneItemRequest = {
  caseFishboneItemId: string;
  categoryCode?: string;
  problemText?: string;
  solutionText?: string;
  isActive?: boolean;
  causeIds?: string[];
};

export type DeleteCaseFishboneItemRequest = {
  caseFishboneItemId: string;
};

type CaseFishboneCauseLite = Pick<
  CaseFishboneCause,
  "caseFishboneCauseId" | "causeNo" | "causeText" | "isActive" | "isDeleted"
>;

type CaseFishboneItemRecord = CaseFishboneItem & {
  causeLinks?: Array<
    CaseFishboneItemCause & {
      cause?: CaseFishboneCauseLite | null;
    }
  >;
};

export function toCaseFishboneItemResponse(
  item: CaseFishboneItemRecord
): CaseFishboneItemResponse {
  const causes = (item.causeLinks ?? [])
    .map((link) => link.cause)
    .filter((cause): cause is CaseFishboneCauseLite => Boolean(cause))
    .map((cause) => ({
      caseFishboneCauseId: cause.caseFishboneCauseId,
      causeNo: cause.causeNo,
      causeText: cause.causeText,
      isActive: cause.isActive,
      isDeleted: cause.isDeleted,
    }))
    .sort((a, b) => a.causeNo - b.causeNo);

  return {
    caseFishboneItemId: item.caseFishboneItemId,
    caseFishboneId: item.caseFishboneId,
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

export const toCaseFishboneItemListResponse = toCaseFishboneItemResponse;
