export type JabatanResponse = {
    jabatanId: string;
    jabatanName: string;
    jabatanLevel: number;
    jabatanDesc: string | null;
    jabatanIsActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type JabatanListResponse = JabatanResponse;
export type CreateJabatanRequest = {
    jabatanName: string;
    jabatanLevel?: number;
    jabatanDesc?: string | null;
    jabatanIsActive?: boolean;
};
export type UpdateJabatanRequest = {
    jabatanId: string;
    jabatanName?: string;
    jabatanLevel?: number;
    jabatanDesc?: string | null;
    jabatanIsActive?: boolean;
};
export type DeleteJabatanRequest = {
    jabatanId: string;
};
export declare function toJabatanResponse(j: any): JabatanResponse;
export declare const toJabatanListResponse: typeof toJabatanResponse;
//# sourceMappingURL=jabatan-model.d.ts.map