export function toCaseFishboneCauseResponse(cause) {
    return {
        caseFishboneCauseId: cause.caseFishboneCauseId,
        caseFishboneId: cause.caseFishboneId,
        causeNo: cause.causeNo,
        causeText: cause.causeText,
        isActive: cause.isActive,
        isDeleted: cause.isDeleted,
        createdAt: cause.createdAt,
        updatedAt: cause.updatedAt,
    };
}
export const toCaseFishboneCauseListResponse = toCaseFishboneCauseResponse;
//# sourceMappingURL=case-fishbone-cause-model.js.map