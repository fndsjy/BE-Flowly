export function toProcedureIkResponse(ik) {
    return {
        ikId: ik.ikId,
        sopId: ik.sopId,
        ikName: ik.ikName,
        ikNumber: ik.ikNumber,
        effectiveDate: ik.effectiveDate,
        ikContent: ik.ikContent ?? null,
        isActive: ik.isActive,
        isDeleted: ik.isDeleted,
        createdAt: ik.createdAt,
        updatedAt: ik.updatedAt,
    };
}
export const toProcedureIkListResponse = toProcedureIkResponse;
//# sourceMappingURL=procedure-ik-model.js.map