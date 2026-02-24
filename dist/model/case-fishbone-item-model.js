export function toCaseFishboneItemResponse(item) {
    const causes = (item.causeLinks ?? [])
        .map((link) => link.cause)
        .filter((cause) => Boolean(cause))
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
//# sourceMappingURL=case-fishbone-item-model.js.map