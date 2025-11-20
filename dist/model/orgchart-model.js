// Helper untuk respons create/update
export function toOrgChartResponse(org) {
    return {
        nodeId: org.nodeId,
        parentId: org.parentId,
        structureId: org.structureId,
        name: org.name,
        position: org.position,
        orderIndex: org.orderIndex,
        userId: org.userId,
    };
}
// Helper untuk list tree
export function toOrgChartListResponse(org) {
    return {
        nodeId: org.nodeId,
        parentId: org.parentId,
        structureId: org.structureId,
        name: org.name ?? "",
        position: org.position,
        orderIndex: org.orderIndex,
        userId: org.userId,
        isDeleted: org.isDeleted,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
    };
}
//# sourceMappingURL=orgchart-model.js.map