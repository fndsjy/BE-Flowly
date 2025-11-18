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
    badgeNumber: string;
    roleId?: string;
};
export type LoginRequest = {
    username: string;
    password: string;
};
export type LoginResponse = {
    username: string;
    name: string;
    token: string;
    expiresIn: number;
    expiresAt: string;
};
export type ChangePasswordRequest = {
    oldPassword: string;
    newPassword: string;
};
export type ChangeRoleRequest = {
    userId: string;
    newRoleId: string;
};
export type UserProfileResponse = {
    userId: string;
    username: string;
    name: string;
    badgeNumber: string;
    department: string | null;
    roleId: string;
    roleName: string;
    roleLevel: number;
};
export type UserListResponse = {
    userId: string;
    username: string;
    name: string;
    badgeNumber: string;
    department: string | null;
    isActive: boolean;
    isDeleted: boolean;
    roleName: string;
    createdAt: Date;
};
export declare function toUserResponse(user: User): UserResponse;
export declare function toLoginResponse(user: User, token: string): LoginResponse;
export declare function toUserProfileResponse(user: User & {
    role: {
        roleName: string;
        roleLevel: number;
    };
}): UserProfileResponse;
export declare function toUserListResponse(user: User & {
    role: {
        roleName: string;
    };
}): UserListResponse;
//# sourceMappingURL=user-model.d.ts.map