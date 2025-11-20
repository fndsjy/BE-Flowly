/* ------------------ HELPERS ------------------ */
// Single response
export function toOrgStructureResponse(s) {
    return {
        structureId: s.structureId,
        name: s.name,
        description: s.description,
        isDeleted: s.isDeleted,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    };
}
// List response (untuk list view)
export function toOrgStructureListResponse(s) {
    return {
        structureId: s.structureId,
        name: s.name,
        description: s.description,
        isDeleted: s.isDeleted,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    };
}
//# sourceMappingURL=orgstructure-model.js.map