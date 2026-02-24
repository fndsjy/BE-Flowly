import { type CreateCaseAttachmentRequest, type UpdateCaseAttachmentRequest, type DeleteCaseAttachmentRequest } from "../model/case-attachment-model.js";
export declare class CaseAttachmentService {
    static create(requesterId: string, reqBody: CreateCaseAttachmentRequest): Promise<import("../model/case-attachment-model.js").CaseAttachmentResponse>;
    static update(requesterId: string, reqBody: UpdateCaseAttachmentRequest): Promise<import("../model/case-attachment-model.js").CaseAttachmentResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseAttachmentRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseId?: string;
    }): Promise<import("../model/case-attachment-model.js").CaseAttachmentResponse[]>;
    static getFile(requesterId: string, caseAttachmentId: string): Promise<{
        fullPath: string;
        fileName: string;
        fileMime: string;
    }>;
}
//# sourceMappingURL=case-attachment-service.d.ts.map