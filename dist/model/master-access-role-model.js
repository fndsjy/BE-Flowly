export function toMasterAccessRoleResponse(m) {
    return {
        masAccessId: m.masAccessId,
        resourceType: m.resourceType,
        resourceKey: m.resourceKey,
        displayName: m.displayName,
        route: m.route ?? null,
        parentKey: m.parentKey ?? null,
        orderIndex: m.orderIndex ?? 0,
        isActive: m.isActive ?? true,
        isDeleted: m.isDeleted ?? false,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
    };
}
export const toMasterAccessRoleListResponse = toMasterAccessRoleResponse;
//# sourceMappingURL=master-access-role-model.js.map