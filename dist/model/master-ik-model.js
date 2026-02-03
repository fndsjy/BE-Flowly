export function toMasterIkResponse(ik) {
    return {
        ikId: ik.ikId,
        ikName: ik.ikName,
        ikNumber: ik.ikNumber,
        effectiveDate: ik.effectiveDate,
        ikContent: ik.ikContent ?? null,
        dibuatOleh: ik.dibuatOleh ?? null,
        diketahuiOleh: ik.diketahuiOleh ?? null,
        disetujuiOleh: ik.disetujuiOleh ?? null,
        dibuatOlehName: ik.dibuatOlehName ?? null,
        diketahuiOlehName: ik.diketahuiOlehName ?? null,
        disetujuiOlehName: ik.disetujuiOlehName ?? null,
        sops: ik.sops ?? [],
        isActive: ik.isActive,
        isDeleted: ik.isDeleted,
        createdAt: ik.createdAt,
        updatedAt: ik.updatedAt,
    };
}
export const toMasterIkListResponse = toMasterIkResponse;
//# sourceMappingURL=master-ik-model.js.map