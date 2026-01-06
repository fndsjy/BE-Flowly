import { type CreateJabatanRequest, type UpdateJabatanRequest, type DeleteJabatanRequest } from "../model/jabatan-model.js";
export declare class JabatanService {
    static create(requesterId: string, reqBody: CreateJabatanRequest): Promise<import("../model/jabatan-model.js").JabatanResponse>;
    static update(requesterId: string, reqBody: UpdateJabatanRequest): Promise<import("../model/jabatan-model.js").JabatanResponse>;
    static softDelete(requesterId: string, reqBody: DeleteJabatanRequest): Promise<{
        message: string;
    }>;
    static list(): Promise<import("../model/jabatan-model.js").JabatanResponse[]>;
}
//# sourceMappingURL=jabatan-service.d.ts.map