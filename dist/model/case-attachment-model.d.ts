import type { CaseAttachment } from "../generated/flowly/client.js";
export type CaseAttachmentResponse = {
    caseAttachmentId: string;
    caseId: string;
    mediaType: string;
    filePath: string;
    fileName: string;
    fileMime: string | null;
    fileSize: number | null;
    caption: string | null;
    locationDesc: string | null;
    orderIndex: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseAttachmentListResponse = CaseAttachmentResponse;
export type CreateCaseAttachmentRequest = {
    caseId: string;
    mediaType: string;
    filePath?: string;
    fileName?: string;
    fileData?: string;
    fileMime?: string | null;
    fileSize?: number | null;
    caption?: string | null;
    locationDesc?: string | null;
    orderIndex?: number;
};
export type UpdateCaseAttachmentRequest = {
    caseAttachmentId: string;
    mediaType?: string;
    filePath?: string;
    fileName?: string;
    fileData?: string;
    fileMime?: string | null;
    fileSize?: number | null;
    caption?: string | null;
    locationDesc?: string | null;
    orderIndex?: number;
    isActive?: boolean;
};
export type DeleteCaseAttachmentRequest = {
    caseAttachmentId: string;
};
export declare function toCaseAttachmentResponse(attachment: CaseAttachment): CaseAttachmentResponse;
export declare const toCaseAttachmentListResponse: typeof toCaseAttachmentResponse;
//# sourceMappingURL=case-attachment-model.d.ts.map