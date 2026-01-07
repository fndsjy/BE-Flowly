/* ------------------ HELPERS ------------------ */
// Single response
export function toPilarResponse(p) {
    return {
        id: p.id,
        pilarName: p.pilar_name,
        description: p.description ?? null,
        jobDesc: p.jobDesc ?? null,
        jabatan: p.jabatan ?? null,
        pic: p.pic ?? null,
        status: p.status,
        isDeleted: p.isDeleted ?? false,
        createdAt: p.created_at ?? p.createdAt,
        updatedAt: p.lastupdate ?? p.updatedAt,
    };
}
// List response
export function toPilarListResponse(p) {
    return {
        id: p.id,
        pilarName: p.pilar_name,
        description: p.description ?? null,
        jobDesc: p.jobDesc ?? null,
        jabatan: p.jabatan ?? null,
        pic: p.pic ?? null,
        status: p.status,
        isDeleted: p.isDeleted ?? false,
        createdAt: p.created_at ?? p.createdAt,
        updatedAt: p.lastupdate ?? p.updatedAt,
    };
}
//# sourceMappingURL=pilar-model.js.map