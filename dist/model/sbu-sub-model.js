export function toSbuSubResponse(s) {
    return {
        id: s.id,
        sbuSubCode: s.sbu_sub_code,
        sbuSubName: s.sbu_sub_name,
        sbuId: s.sbu_id,
        sbuPilar: s.sbu_pilar,
        description: s.description ?? null,
        jobDesc: s.jobDesc ?? null,
        pic: s.pic ?? null,
        status: s.status,
        isDeleted: s.isDeleted ?? false,
        createdAt: s.created_at ?? s.createdAt ?? null,
        updatedAt: s.lastupdate ?? s.updatedAt ?? null,
    };
}
export const toSbuSubListResponse = toSbuSubResponse;
//# sourceMappingURL=sbu-sub-model.js.map