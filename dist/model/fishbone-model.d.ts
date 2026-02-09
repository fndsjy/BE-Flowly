import type { MasterFishbone } from "../generated/flowly/client.js";
export type FishboneResponse = {
    fishboneId: string;
    sbuSubId: number;
    fishboneName: string;
    fishboneDesc: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type FishboneListResponse = FishboneResponse;
export type CreateFishboneRequest = {
    sbuSubId: number;
    fishboneName: string;
    fishboneDesc?: string | null;
};
export type UpdateFishboneRequest = {
    fishboneId: string;
    sbuSubId?: number;
    fishboneName?: string;
    fishboneDesc?: string | null;
    isActive?: boolean;
};
export type DeleteFishboneRequest = {
    fishboneId: string;
};
export declare function toFishboneResponse(fishbone: MasterFishbone): FishboneResponse;
export declare const toFishboneListResponse: typeof toFishboneResponse;
//# sourceMappingURL=fishbone-model.d.ts.map