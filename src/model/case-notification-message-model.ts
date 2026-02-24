export type CaseNotificationMessageRecord = {
  caseNotificationMessageId: string;
  caseId: string | null;
  caseDepartmentId: string | null;
  recipientEmployeeId: number | null;
  role: string;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseNotificationMessageResponse = {
  caseNotificationMessageId: string;
  caseId: string | null;
  caseDepartmentId: string | null;
  recipientEmployeeId: number | null;
  role: string;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseNotificationMessageListResponse =
  CaseNotificationMessageResponse;

export type CreateCaseNotificationMessageRequest = {
  caseId: string;
  caseDepartmentId?: string | null;
  recipientEmployeeId: number;
  role: string;
  messageTemplate: string;
  isActive?: boolean;
};

export type UpdateCaseNotificationMessageRequest = {
  caseNotificationMessageId: string;
  messageTemplate?: string;
  isActive?: boolean;
};

export type DeleteCaseNotificationMessageRequest = {
  caseNotificationMessageId: string;
};

export function toCaseNotificationMessageResponse(
  item: CaseNotificationMessageRecord
): CaseNotificationMessageResponse {
  return {
    caseNotificationMessageId: item.caseNotificationMessageId,
    caseId: item.caseId ?? null,
    caseDepartmentId: item.caseDepartmentId ?? null,
    recipientEmployeeId: item.recipientEmployeeId ?? null,
    role: item.role,
    messageTemplate: item.messageTemplate,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const toCaseNotificationMessageListResponse =
  toCaseNotificationMessageResponse;
