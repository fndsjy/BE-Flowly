export type PilarResponse = {
    id: number;
    pilarName: string;
    description: string | null;
    pic: number | null;
    status: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type PilarListResponse = {
    id: number;
    pilarName: string;
    description: string | null;
    pic: number | null;
    status: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CreatePilarRequest = {
    pilarName: string;
    description?: string | null;
    pic?: number | null;
};
export type UpdatePilarRequest = {
    id: number;
    pilarName?: string;
    description?: string | null;
    pic?: number | null;
    status?: string;
};
export type DeletePilarRequest = {
    id: number;
};
export declare function toPilarResponse(p: any): PilarResponse;
export declare function toPilarListResponse(p: any): PilarListResponse;
//# sourceMappingURL=pilar-model.d.ts.map