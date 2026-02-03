import { type CreateProcedureSopIkRequest, type UpdateProcedureSopIkRequest, type DeleteProcedureSopIkRequest } from "../model/procedure-sop-ik-model.js";
export declare class ProcedureSopIkService {
    static create(requesterId: string, reqBody: CreateProcedureSopIkRequest): Promise<import("../model/procedure-sop-ik-model.js").ProcedureSopIkResponse[]>;
    static update(requesterId: string, reqBody: UpdateProcedureSopIkRequest): Promise<import("../model/procedure-sop-ik-model.js").ProcedureSopIkResponse>;
    static softDelete(requesterId: string, reqBody: DeleteProcedureSopIkRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        sopId?: string;
        ikId?: string;
    }): Promise<import("../model/procedure-sop-ik-model.js").ProcedureSopIkResponse[]>;
}
//# sourceMappingURL=procedure-sop-ik-service.d.ts.map