export function toCaseNotificationMessageResponse(item) {
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
export const toCaseNotificationMessageListResponse = toCaseNotificationMessageResponse;
//# sourceMappingURL=case-notification-message-model.js.map