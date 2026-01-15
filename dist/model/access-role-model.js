export function toAccessRoleResponse(a) {
    return {
        accessId: a.accessId,
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        resourceType: a.resourceType,
        masAccessId: a.masAccessId ?? null,
        resourceKey: a.resourceKey ?? null,
        accessLevel: a.accessLevel,
        isActive: a.isActive ?? true,
        isDeleted: a.isDeleted ?? false,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}
export const toAccessRoleListResponse = toAccessRoleResponse;
//# sourceMappingURL=access-role-model.js.map