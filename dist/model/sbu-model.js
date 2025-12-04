/* ========== HELPERS ========== */
export function toSbuResponse(s) {
    return {
        id: s.id,
        sbuCode: s.sbu_code,
        sbuName: s.sbu_name,
        sbuPilar: s.sbu_pilar,
        description: s.description ?? null,
        pic: s.pic ?? null,
        status: s.status,
        isDeleted: s.isDeleted ?? false,
        createdAt: s.created_at ?? s.createdAt,
        updatedAt: s.lastupdate ?? s.updatedAt,
    };
}
export const toSbuListResponse = toSbuResponse;
//# sourceMappingURL=sbu-model.js.map