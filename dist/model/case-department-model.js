export function toCaseDepartmentResponse(department) {
    const assignees = (department.assignees ?? []).filter((item) => item && item.employeeId);
    const assigneeEmployeeIds = Array.from(new Set(assignees.map((item) => item.employeeId)));
    if (assigneeEmployeeIds.length === 0 && department.assigneeEmployeeId) {
        assigneeEmployeeIds.push(department.assigneeEmployeeId);
    }
    return {
        caseDepartmentId: department.caseDepartmentId,
        caseId: department.caseId,
        sbuSubId: department.sbuSubId,
        decisionStatus: department.decisionStatus,
        decisionAt: department.decisionAt ?? null,
        decisionBy: department.decisionBy ?? null,
        decisionNotes: department.decisionNotes ?? null,
        assigneeEmployeeId: department.assigneeEmployeeId ?? null,
        assigneeEmployeeIds,
        assignees: assignees.map((item) => ({
            employeeId: item.employeeId,
            assignedAt: item.assignedAt ?? null,
            assignedBy: item.assignedBy ?? null,
        })),
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