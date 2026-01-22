import { type CreateProcedureSopRequest, type UpdateProcedureSopRequest, type DeleteProcedureSopRequest } from "../model/procedure-sop-model.js";
export declare class ProcedureSopService {
    static create(requesterId: string, reqBody: CreateProcedureSopRequest): Promise<import("../model/procedure-sop-model.js").ProcedureSopResponse>;
    static update(requesterId: string, reqBody: UpdateProcedureSopRequest): Promise<import("../model/procedure-sop-model.js").ProcedureSopResponse>;
    static softDelete(requesterId: string, reqBody: DeleteProcedureSopRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        sbuSubId?: number;
        sbuId?: number;
        pilarId?: number;
        sopNumber?: string;
    }): Promise<import("../model/procedure-sop-model.js").ProcedureSopResponse[]>;
}
//# sourceMappingURL=procedure-sop-service.d.ts.map