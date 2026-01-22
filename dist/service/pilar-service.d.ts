import { type CreatePilarRequest, type UpdatePilarRequest, type DeletePilarRequest } from "../model/pilar-model.js";
export declare class PilarService {
    static create(requesterId: string, reqBody: CreatePilarRequest): Promise<import("../model/pilar-model.js").PilarResponse>;
    static update(requesterId: string, reqBody: UpdatePilarRequest): Promise<import("../model/pilar-model.js").PilarResponse>;
    static softDelete(requesterId: string, reqBody: DeletePilarRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string): Promise<import("../model/pilar-model.js").PilarListResponse[]>;
    static listPublic(_requesterId: string): Promise<import("../model/pilar-model.js").PilarListResponse[]>;
}
//# sourceMappingURL=pilar-service.d.ts.map