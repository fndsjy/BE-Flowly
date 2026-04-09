import type { UserProfileResponse } from "../model/user-model.js";
export declare const invalidateProfileCache: (userId?: string) => void;
export declare const withProfileCache: (userId: string, loader: () => Promise<UserProfileResponse>) => Promise<UserProfileResponse>;
//# sourceMappingURL=profile-cache.d.ts.map