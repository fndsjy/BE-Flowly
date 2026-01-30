import type { MasterIK } from "../generated/flowly/client.js";
export type MasterIkResponse = {
    ikId: string;
    ikName: string;
    ikNumber: string;
    effectiveDate: Date;
    ikContent: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type MasterIkListResponse = MasterIkResponse;
export type CreateMasterIkRequest = {
    ikName: string;
    ikNumber: string;
    effectiveDate: Date | string;
    ikContent?: string | null;
};
export type UpdateMasterIkRequest = {
    ikId: string;
    ikName?: string;
    ikNumber?: string;
    effectiveDate?: Date | string;
    ikContent?: string | null;
    isActive?: boolean;
};
export type DeleteMasterIkRequest = {
    ikId: string;
};
export declare function toMasterIkResponse(ik: MasterIK): MasterIkResponse;
export declare const toMasterIkListResponse: typeof toMasterIkResponse;
//# sourceMappingURL=master-ik-model.d.ts.map