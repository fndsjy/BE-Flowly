import { type CreateCaseFishboneRequest, type UpdateCaseFishboneRequest, type DeleteCaseFishboneRequest } from "../model/case-fishbone-model.js";
export declare class CaseFishboneService {
    static create(requesterId: string, reqBody: CreateCaseFishboneRequest): Promise<import("../model/case-fishbone-model.js").CaseFishboneResponse>;
    static update(requesterId: string, reqBody: UpdateCaseFishboneRequest): Promise<import("../model/case-fishbone-model.js").CaseFishboneResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseFishboneRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseId?: string;
        sbuSubId?: number;
        caseFishboneId?: string;
    }): Promise<import("../model/case-fishbone-model.js").CaseFishboneResponse[]>;
}
//# sourceMappingURL=case-fishbone-service.d.ts.map