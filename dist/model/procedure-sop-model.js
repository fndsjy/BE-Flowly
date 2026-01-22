export function toProcedureSopResponse(sop) {
    return {
        sopId: sop.sopId,
        sbuSubId: sop.sbuSubId,
        sbuId: sop.sbuId ?? null,
        pilarId: sop.pilarId ?? null,
        sopName: sop.sopName,
        sopNumber: sop.sopNumber,
        effectiveDate: sop.effectiveDate,
        filePath: sop.filePath,
        fileName: sop.fileName,
        fileMime: sop.fileMime ?? null,
        fileSize: sop.fileSize ?? null,
        isActive: sop.isActive,
        isDeleted: sop.isDeleted,
        createdAt: sop.createdAt,
        updatedAt: sop.updatedAt,
    };
}
export const toProcedureSopListResponse = toProcedureSopResponse;
//# sourceMappingURL=procedure-sop-model.js.map