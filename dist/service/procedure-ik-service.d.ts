import { type CreateProcedureIkRequest, type UpdateProcedureIkRequest, type DeleteProcedureIkRequest } from "../model/procedure-ik-model.js";
export declare class ProcedureIkService {
    static create(requesterId: string, reqBody: CreateProcedureIkRequest): Promise<import("../model/procedure-ik-model.js").ProcedureIkResponse>;
    static update(requesterId: string, reqBody: UpdateProcedureIkRequest): Promise<import("../model/procedure-ik-model.js").ProcedureIkResponse>;
    static softDelete(requesterId: string, reqBody: DeleteProcedureIkRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        sopId?: string;
    }): Promise<import("../model/procedure-ik-model.js").ProcedureIkResponse[]>;
}
//# sourceMappingURL=procedure-ik-service.d.ts.map