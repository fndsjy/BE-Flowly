import type { CaseDepartment } from "../generated/flowly/client.js";

export type CaseDepartmentResponse = {
  caseDepartmentId: string;
  caseId: string;
  sbuSubId: number;
  decisionStatus: string;
  decisionAt: Date | null;
  decisionBy: string | null;
  decisionNotes: string | null;
  assigneeEmployeeId: number | null;
  assigneeEmployeeIds: number[];
  assignees: {
    employeeId: number;
    assignedAt: Date | null;
    assignedBy: string | null;
  }[];
  assignedAt: Date | null;
  assignedBy: string | null;
  workStatus: string | null;
  startDate: Date | null;
  targetDate: Date | null;
  endDate: Date | null;
  workNotes: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseDepartmentListResponse = CaseDepartmentResponse;

export type CreateCaseDepartmentRequest = {
  caseId: string;
  sbuSubId: number;
};

export type UpdateCaseDepartmentRequest = {
  caseDepartmentId: string;
  decisionStatus?: string;
  decisionNotes?: string | null;
  assigneeEmployeeId?: number | null;
  assigneeEmployeeIds?: number[] | null;
  workStatus?: string | null;
  startDate?: Date | string | null;
  targetDate?: Date | string | null;
  endDate?: Date | string | null;
  workNotes?: string | null;
  isActive?: boolean;
};

export type DeleteCaseDepartmentRequest = {
  caseDepartmentId: string;
};

export function toCaseDepartmentResponse(
  department: CaseDepartment & {
    assignees?: Array<{
      employeeId: number;
      assignedAt: Date | null;
      assignedBy: string | null;
      isDeleted?: boolean;
      isActive?: boolean;
    }>;
  }
): CaseDepartmentResponse {
  const assignees = (department.assignees ?? []).filter(
    (item) => item && item.employeeId
  );
  const assigneeEmployeeIds = Array.from(
    new Set(assignees.map((item) => item.employeeId))
  );
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
