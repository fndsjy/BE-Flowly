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

export function toCaseAttachmentResponse(
  attachment: CaseAttachment
): CaseAttachmentResponse {
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
