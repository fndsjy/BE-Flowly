export function toFishboneItemResponse(item) {
    const causes = (item.causeLinks ?? [])
        .map((link) => link.cause)
        .filter((cause) => Boolean(cause))
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
//# sourceMappingURL=fishbone-item-model.js.map