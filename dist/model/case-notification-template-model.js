export function toCaseNotificationTemplateResponse(item) {
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
export const toCaseNotificationTemplateListResponse = toCaseNotificationTemplateResponse;
//# sourceMappingURL=case-notification-template-model.js.map