import type { MasterIK } from "../generated/flowly/client.js";
export type MasterIkResponse = {
    ikId: string;
    ikName: string;
    ikNumber: string;
    effectiveDate: Date;
    ikContent: string | null;
    dibuatOleh: number | null;
    diketahuiOleh: number | null;
    disetujuiOleh: number | null;
    dibuatOlehName?: string | null;
    diketahuiOlehName?: string | null;
    disetujuiOlehName?: string | null;
    createdByName?: string | null;
    sops: MasterIkSopInfo[];
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type MasterIkSopInfo = {
    sopId: string;
    sopName: string;
    sbuSubId: number;
    sbuSubName: string | null;
};
export type MasterIkListResponse = MasterIkResponse;
export type MasterIkListFilters = {
    sopId?: string;
    search?: string;
    status?: "all" | "active" | "inactive";
    page?: number;
    pageSize?: number;
};
export type MasterIkPaginatedListResponse = {
    data: MasterIkListResponse[];
    page: number;
    pageSize: number;
    total: number;
    activeTotal: number;
};
export type CreateMasterIkRequest = {
    ikName: string;
    ikNumber: string;
    effectiveDate: Date | string;
    ikContent?: string | null;
    dibuatOleh?: number | null;
    diketahuiOleh?: number | null;
    disetujuiOleh?: number | null;
    sopIds?: string[];
};
export type UpdateMasterIkRequest = {
    ikId: string;
    ikName?: string;
    ikNumber?: string;
    effectiveDate?: Date | string;
    ikContent?: string | null;
    dibuatOleh?: number | null;
    diketahuiOleh?: number | null;
    disetujuiOleh?: number | null;
    isActive?: boolean;
    sopIds?: string[];
};
export type DeleteMasterIkRequest = {
    ikId: string;
};
type MasterIkRecord = MasterIK & {
    dibuatOleh?: number | null;
    diketahuiOleh?: number | null;
    disetujuiOleh?: number | null;
    sops?: MasterIkSopInfo[];
    dibuatOlehName?: string | null;
    diketahuiOlehName?: string | null;
    disetujuiOlehName?: string | null;
    createdByName?: string | null;
};
export declare function toMasterIkResponse(ik: MasterIkRecord): MasterIkResponse;
export declare const toMasterIkListResponse: typeof toMasterIkResponse;
export {};
//# sourceMappingURL=master-ik-model.d.ts.map