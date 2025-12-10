export type SbuSubResponse = {
    id: number;
    sbuSubCode: string;
    sbuSubName: string;
    sbuId: number | null;
    sbuPilar: number | null;
    description: string | null;
    pic: number | null;
    status: string;
    isDeleted: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SbuSubListResponse = SbuSubResponse;
export type CreateSbuSubRequest = {
    sbuSubCode: string;
    sbuSubName: string;
    sbuId: number;
    sbuPilar?: number | null;
    description?: string | null;
    pic?: number | null;
};
export type UpdateSbuSubRequest = {
    id: number;
    sbuSubCode?: string;
    sbuSubName?: string;
    sbuId?: number;
    sbuPilar?: number | null;
    description?: string | null;
    pic?: number | null;
    status?: string;
};
export type DeleteSbuSubRequest = {
    id: number;
};
export declare function toSbuSubResponse(s: any): SbuSubResponse;
export declare const toSbuSubListResponse: typeof toSbuSubResponse;
//# sourceMappingURL=sbu-sub-model.d.ts.map