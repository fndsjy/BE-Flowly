export function toCasePdcaItemResponse(item) {
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
//# sourceMappingURL=case-pdca-model.js.map