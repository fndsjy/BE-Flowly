export function toFishboneResponse(fishbone) {
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
//# sourceMappingURL=fishbone-model.js.map