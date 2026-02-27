export function toCaseDepartmentResponse(department) {
    return {
        caseDepartmentId: department.caseDepartmentId,
        caseId: department.caseId,
        sbuSubId: department.sbuSubId,
        decisionStatus: department.decisionStatus,
        decisionAt: department.decisionAt ?? null,
        decisionBy: department.decisionBy ?? null,
        decisionNotes: department.decisionNotes ?? null,
        assigneeEmployeeId: department.assigneeEmployeeId ?? null,
        assignedAt: department.assignedAt ?? null,
        assignedBy: department.assignedBy ?? null,
        workStatus: department.workStatus ?? null,
        startDate: department.startDate ?? null,
        targetDate: department.targetDate ?? null,
        endDate: department.endDate ?? null,
        workNotes: department.workNotes ?? null,
        isActive: department.isActive,
        isDeleted: department.isDeleted,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
    };
}
export const toCaseDepartmentListResponse = toCaseDepartmentResponse;
//# sourceMappingURL=case-department-model.js.map