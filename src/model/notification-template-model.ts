export type NotificationTemplatePortalMappingRecord = {
  notificationTemplatePortalId: string;
  portalKey: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationTemplateRecord = {
  notificationTemplateId: string;
  templateName: string;
  channel: string;
  eventKey: string;
  recipientRole: string;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  portalMappings?: NotificationTemplatePortalMappingRecord[] | null;
};

export type NotificationTemplatePortalMappingResponse = {
  notificationTemplatePortalId: string;
  portalKey: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationTemplateResponse = {
  notificationTemplateId: string;
  templateName: string;
  channel: string;
  eventKey: string;
  recipientRole: string;
  messageTemplate: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  appliesToAllPortals: boolean;
  portalKeys: string[];
  portalMappings: NotificationTemplatePortalMappingResponse[];
};

export type NotificationTemplateListResponse = NotificationTemplateResponse;

export type CreateNotificationTemplateRequest = {
  templateName: string;
  channel: string;
  eventKey: string;
  recipientRole: string;
  messageTemplate: string;
  portalKeys?: string[];
  isActive?: boolean;
};

export type UpdateNotificationTemplateRequest = {
  notificationTemplateId: string;
  templateName?: string;
  channel?: string;
  eventKey?: string;
  recipientRole?: string;
  messageTemplate?: string;
  portalKeys?: string[];
  isActive?: boolean;
};

export type DeleteNotificationTemplateRequest = {
  notificationTemplateId: string;
};

export type ListManualNotificationRecipientsRequest = {
  portalKey?: string;
  search?: string;
  limit?: number;
};

export type ManualNotificationRecipient = {
  userId: number;
  employeeName: string | null;
  cardNumber: string | null;
  badgeNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  isFirstLogin: boolean;
  latestAssignmentId: string | null;
  latestAssignmentStatus: string | null;
  latestStartedAt: Date | null;
  latestDueAt: Date | null;
};

export type ManualNotificationDefaults = {
  portalKey: string;
  portalName: string;
  loginUrl: string;
  hrdUrl: string;
  supportName: string;
  supportPhone: string;
};

export type ListManualNotificationRecipientsResponse =
  ManualNotificationDefaults & {
    recipients: ManualNotificationRecipient[];
  };

export type ManualSendNotificationRequest = {
  notificationTemplateId: string;
  portalKey: string;
  userIds: number[];
  messageTemplate?: string;
};

export type ManualSendNotificationRecipientResult = {
  userId: number;
  employeeName: string | null;
  phoneNumber: string | null;
  email: string | null;
  notificationOutboxId: string | null;
  status: "QUEUED" | "SKIPPED";
  error: string | null;
};

export type ManualSendNotificationResponse = {
  queued: number;
  skipped: number;
  recipients: ManualSendNotificationRecipientResult[];
};

export type TestNotificationRecipientResult = {
  userId: number;
  employeeName: string | null;
  phoneNumber: string | null;
  notificationOutboxId: string | null;
  status: string;
  error: string | null;
};

export type TestWhatsappNotificationResponse = {
  configuredUserIds: number[];
  sent: number;
  pending: number;
  failed: number;
  skipped: number;
  recipients: TestNotificationRecipientResult[];
};

export const toNotificationTemplatePortalMappingResponse = (
  item: NotificationTemplatePortalMappingRecord
): NotificationTemplatePortalMappingResponse => ({
  notificationTemplatePortalId: item.notificationTemplatePortalId,
  portalKey: item.portalKey,
  isActive: item.isActive,
  isDeleted: item.isDeleted,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export function toNotificationTemplateResponse(
  item: NotificationTemplateRecord
): NotificationTemplateResponse {
  const portalMappings = (item.portalMappings ?? [])
    .filter((mapping) => !mapping.isDeleted)
    .sort((left, right) => left.portalKey.localeCompare(right.portalKey))
    .map(toNotificationTemplatePortalMappingResponse);

  return {
    notificationTemplateId: item.notificationTemplateId,
    templateName: item.templateName,
    channel: item.channel,
    eventKey: item.eventKey,
    recipientRole: item.recipientRole,
    messageTemplate: item.messageTemplate,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    appliesToAllPortals: portalMappings.length === 0,
    portalKeys: portalMappings.map((mapping) => mapping.portalKey),
    portalMappings,
  };
}

export const toNotificationTemplateListResponse =
  toNotificationTemplateResponse;
