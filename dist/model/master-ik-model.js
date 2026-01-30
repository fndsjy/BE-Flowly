export function toMasterIkResponse(ik) {
    return {
        ikId: ik.ikId,
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
export const toMasterIkListResponse = toMasterIkResponse;
//# sourceMappingURL=master-ik-model.js.map