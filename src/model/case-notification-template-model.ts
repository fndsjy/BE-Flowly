export type CaseNotificationTemplateRecord = {
  caseNotificationTemplateId: string;
  templateName: string;
  channel: string;
  role: string;
  action: string | null;
  caseType: string | null;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseNotificationTemplateResponse = {
  caseNotificationTemplateId: string;
  templateName: string;
  channel: string;
  role: string;
  action: string | null;
  caseType: string | null;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseNotificationTemplateListResponse =
  CaseNotificationTemplateResponse;

export type CreateCaseNotificationTemplateRequest = {
  templateName: string;
  channel: string;
  role: string;
  action?: string | null;
  caseType?: string | null;
  messageTemplate: string;
  isActive?: boolean;
};

export type UpdateCaseNotificationTemplateRequest = {
  caseNotificationTemplateId: string;
  templateName?: string;
  channel?: string;
  role?: string;
  action?: string | null;
  caseType?: string | null;
  messageTemplate?: string;
  isActive?: boolean;
};

export type DeleteCaseNotificationTemplateRequest = {
  caseNotificationTemplateId: string;
};

export function toCaseNotificationTemplateResponse(
  item: CaseNotificationTemplateRecord
): CaseNotificationTemplateResponse {
  return {
    caseNotificationTemplateId: item.caseNotificationTemplateId,
    templateName: item.templateName,
    channel: item.channel,
    role: item.role,
    action: item.action ?? null,
    caseType: item.caseType ?? null,
    messageTemplate: item.messageTemplate,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const toCaseNotificationTemplateListResponse =
  toCaseNotificationTemplateResponse;
