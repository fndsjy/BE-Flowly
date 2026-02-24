export function toCaseAttachmentResponse(attachment) {
    return {
        caseAttachmentId: attachment.caseAttachmentId,
        caseId: attachment.caseId,
        mediaType: attachment.mediaType,
        filePath: attachment.filePath,
        fileName: attachment.fileName,
        fileMime: attachment.fileMime ?? null,
        fileSize: attachment.fileSize ?? null,
        caption: attachment.caption ?? null,
        locationDesc: attachment.locationDesc ?? null,
        orderIndex: attachment.orderIndex,
        isActive: attachment.isActive,
        isDeleted: attachment.isDeleted,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
    };
}
export const toCaseAttachmentListResponse = toCaseAttachmentResponse;
//# sourceMappingURL=case-attachment-model.js.map