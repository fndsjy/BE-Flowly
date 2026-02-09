import type { FishboneCause } from "../generated/flowly/client.js";
export type FishboneCauseResponse = {
    fishboneCauseId: string;
    fishboneId: string;
    causeNo: number;
    causeText: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type FishboneCauseListResponse = FishboneCauseResponse;
export type CreateFishboneCauseRequest = {
    fishboneId: string;
    causeNo: number;
    causeText: string;
};
export type UpdateFishboneCauseRequest = {
    fishboneCauseId: string;
    causeNo?: number;
    causeText?: string;
    isActive?: boolean;
};
export type DeleteFishboneCauseRequest = {
    fishboneCauseId: string;
};
export declare function toFishboneCauseResponse(cause: FishboneCause): FishboneCauseResponse;
export declare const toFishboneCauseListResponse: typeof toFishboneCauseResponse;
//# sourceMappingURL=fishbone-cause-model.d.ts.map