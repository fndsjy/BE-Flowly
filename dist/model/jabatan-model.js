/* ------------------ HELPERS ------------------ */
export function toJabatanResponse(j) {
    return {
        jabatanId: j.jabatanId,
        jabatanName: j.jabatanName,
        jabatanLevel: j.jabatanLevel,
        jabatanDesc: j.jabatanDesc ?? null,
        jabatanIsActive: j.jabatanIsActive ?? true,
        isDeleted: j.isDeleted ?? false,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
    };
}
export const toJabatanListResponse = toJabatanResponse;
//# sourceMappingURL=jabatan-model.js.map