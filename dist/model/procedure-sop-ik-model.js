export function toProcedureSopIkResponse(link) {
    return {
        sopIkId: link.sopIkId,
        sopId: link.sopId,
        ikId: link.ikId,
        isActive: link.isActive,
        isDeleted: link.isDeleted,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        sopName: link.sop?.sopName ?? null,
        sopNumber: link.sop?.sopNumber ?? null,
        ikName: link.masterIK?.ikName ?? null,
        ikNumber: link.masterIK?.ikNumber ?? null,
        ikEffectiveDate: link.masterIK?.effectiveDate ?? null,
        ikIsActive: link.masterIK?.isActive ?? null,
    };
}
export const toProcedureSopIkListResponse = toProcedureSopIkResponse;
//# sourceMappingURL=procedure-sop-ik-model.js.map