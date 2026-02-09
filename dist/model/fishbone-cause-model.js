export function toFishboneCauseResponse(cause) {
    return {
        fishboneCauseId: cause.fishboneCauseId,
        fishboneId: cause.fishboneId,
        causeNo: cause.causeNo,
        causeText: cause.causeText,
        isActive: cause.isActive,
        isDeleted: cause.isDeleted,
        createdAt: cause.createdAt,
        updatedAt: cause.updatedAt,
    };
}
export const toFishboneCauseListResponse = toFishboneCauseResponse;
//# sourceMappingURL=fishbone-cause-model.js.map