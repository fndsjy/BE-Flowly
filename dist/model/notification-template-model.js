export const toNotificationTemplatePortalMappingResponse = (item) => ({
    notificationTemplatePortalId: item.notificationTemplatePortalId,
    portalKey: item.portalKey,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});
export function toNotificationTemplateResponse(item) {
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
export const toNotificationTemplateListResponse = toNotificationTemplateResponse;
//# sourceMappingURL=notification-template-model.js.map