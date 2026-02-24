import { type CreateCaseFishboneCauseRequest, type UpdateCaseFishboneCauseRequest, type DeleteCaseFishboneCauseRequest } from "../model/case-fishbone-cause-model.js";
export declare class CaseFishboneCauseService {
    static create(requesterId: string, reqBody: CreateCaseFishboneCauseRequest): Promise<import("../model/case-fishbone-cause-model.js").CaseFishboneCauseResponse>;
    static update(requesterId: string, reqBody: UpdateCaseFishboneCauseRequest): Promise<import("../model/case-fishbone-cause-model.js").CaseFishboneCauseResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseFishboneCauseRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseFishboneId?: string;
    }): Promise<import("../model/case-fishbone-cause-model.js").CaseFishboneCauseResponse[]>;
}
//# sourceMappingURL=case-fishbone-cause-service.d.ts.map