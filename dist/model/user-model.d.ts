import type { User } from "@prisma/client";
export type UserResponse = {
    username: string;
    name: string;
    token?: string;
};
export type CreateUserRequest = {
    username: string;
    name: string;
    password: string;
};
export declare function toUserResponse(user: User): UserResponse;
//# sourceMappingURL=user-model.d.ts.map