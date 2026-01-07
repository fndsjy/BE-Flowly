export type SbuResponse = {
    id: number;
    sbuCode: string;
    sbuName: string;
    sbuPilar: number;
    description: string | null;
    jobDesc: string | null;
    jabatan: string | null;
    pic: number | null;
    status: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type SbuListResponse = SbuResponse;
export type CreateSbuRequest = {
    sbuCode: string;
    sbuName: string;
    sbuPilar: number;
    description?: string | null;
    jobDesc?: string | null;
    jabatan?: string | null;
    pic?: number | null;
};
export type UpdateSbuRequest = {
    id: number;
    sbuCode?: string;
    sbuName?: string;
    sbuPilar?: number;
    description?: string | null;
    jobDesc?: string | null;
    jabatan?: string | null;
    pic?: number | null;
    status?: string;
};
export type DeleteSbuRequest = {
    id: number;
};
export declare function toSbuResponse(s: any): SbuResponse;
export declare const toSbuListResponse: typeof toSbuResponse;
//# sourceMappingURL=sbu-model.d.ts.map