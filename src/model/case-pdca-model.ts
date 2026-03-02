import type { CasePdcaItem } from "../generated/flowly/client.js";

export type CasePdcaItemResponse = {
  casePdcaItemId: string;
  caseId: string;
  itemNo: number;
  planText: string | null;
  doText: string | null;
  doStartDate: Date | null;
  doEndDate: Date | null;
  checkText: string | null;
  checkStartDate: Date | null;
  checkEndDate: Date | null;
  checkBy: string | null;
  checkComment: string | null;
  actText: string | null;
  actStartDate: Date | null;
  actEndDate: Date | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CasePdcaItemListResponse = CasePdcaItemResponse;

export type CreateCasePdcaItemRequest = {
  caseId: string;
  itemNo?: number;
  planText?: string | null;
  doText?: string | null;
  doStartDate?: Date | string | null;
  doEndDate?: Date | string | null;
  checkText?: string | null;
  checkStartDate?: Date | string | null;
  checkEndDate?: Date | string | null;
  checkBy?: string | null;
  checkComment?: string | null;
  actText?: string | null;
  actStartDate?: Date | string | null;
  actEndDate?: Date | string | null;
};

export type UpdateCasePdcaItemRequest = {
  casePdcaItemId: string;
  itemNo?: number;
  planText?: string | null;
  doText?: string | null;
  doStartDate?: Date | string | null;
  doEndDate?: Date | string | null;
  checkText?: string | null;
  checkStartDate?: Date | string | null;
  checkEndDate?: Date | string | null;
  checkBy?: string | null;
  checkComment?: string | null;
  actText?: string | null;
  actStartDate?: Date | string | null;
  actEndDate?: Date | string | null;
  isActive?: boolean;
};

export type DeleteCasePdcaItemRequest = {
  casePdcaItemId: string;
};

export function toCasePdcaItemResponse(
  item: CasePdcaItem
): CasePdcaItemResponse {
  return {
    casePdcaItemId: item.casePdcaItemId,
    caseId: item.caseId,
    itemNo: item.itemNo,
    planText: item.planText ?? null,
    doText: item.doText ?? null,
    doStartDate: item.doStartDate ?? null,
    doEndDate: item.doEndDate ?? null,
    checkText: item.checkText ?? null,
    checkStartDate: item.checkStartDate ?? null,
    checkEndDate: item.checkEndDate ?? null,
    checkBy: item.checkBy ?? null,
    checkComment: item.checkComment ?? null,
    actText: item.actText ?? null,
    actStartDate: item.actStartDate ?? null,
    actEndDate: item.actEndDate ?? null,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const toCasePdcaItemListResponse = toCasePdcaItemResponse;
