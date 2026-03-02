import { type CreateCasePdcaItemRequest, type UpdateCasePdcaItemRequest, type DeleteCasePdcaItemRequest } from "../model/case-pdca-model.js";
export declare class CasePdcaService {
    static create(requesterId: string, reqBody: CreateCasePdcaItemRequest): Promise<import("../model/case-pdca-model.js").CasePdcaItemResponse>;
    static update(requesterId: string, reqBody: UpdateCasePdcaItemRequest): Promise<import("../model/case-pdca-model.js").CasePdcaItemResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCasePdcaItemRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseId?: string;
    }): Promise<import("../model/case-pdca-model.js").CasePdcaItemResponse[]>;
}
//# sourceMappingURL=case-pdca-service.d.ts.map