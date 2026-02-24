export function toCaseFishboneResponse(fishbone) {
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
//# sourceMappingURL=case-fishbone-model.js.map