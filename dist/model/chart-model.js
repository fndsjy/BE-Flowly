// Helper untuk respons create/update
export function toChartResponse(org) {
    return {
        chartId: org.chartId,
        parentId: org.parentId,
        pilarId: org.pilarId,
        sbuId: org.sbuId,
        sbuSubId: org.sbuSubId,
        position: org.position,
        capacity: org.capacity,
        orderIndex: org.orderIndex,
        jobDesc: org.jobDesc,
    };
}
// // Helper untuk list tree
export function toChartListResponse(org) {
    return {
        chartId: org.chartId,
        parentId: org.parentId,
        pilarId: org.pilarId,
        sbuId: org.sbuId,
        sbuSubId: org.sbuSubId,
        position: org.position,
        capacity: org.capacity,
        orderIndex: org.orderIndex,
        jobDesc: org.jobDesc,
        isDeleted: org.isDeleted,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
    };
}
//# sourceMappingURL=chart-model.js.map