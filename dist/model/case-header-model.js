export function toCaseHeaderResponse(caseHeader) {
    return {
        caseId: caseHeader.caseId,
        caseType: caseHeader.caseType,
        caseTitle: caseHeader.caseTitle,
        background: caseHeader.background ?? null,
        currentCondition: caseHeader.currentCondition ?? null,
        projectDesc: caseHeader.projectDesc ?? null,
        projectObjective: caseHeader
            .projectObjective ?? null,
        locationDesc: caseHeader.locationDesc ?? null,
        notes: caseHeader.notes ?? null,
        status: caseHeader.status,
        visibility: caseHeader.visibility ??
            "PRIVATE",
        requesterId: caseHeader.requesterId ?? null,
        requesterEmployeeId: caseHeader.requesterEmployeeId ?? null,
        originSbuSubId: caseHeader.originSbuSubId ?? null,
        isActive: caseHeader.isActive,
        isDeleted: caseHeader.isDeleted,
        createdAt: caseHeader.createdAt,
        updatedAt: caseHeader.updatedAt,
    };
}
export const toCaseHeaderListResponse = toCaseHeaderResponse;
//# sourceMappingURL=case-header-model.js.map