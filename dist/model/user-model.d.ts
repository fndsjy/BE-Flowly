import type { User, Role } from "../generated/flowly/client.js";
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
    username?: string;
    badgeNumber?: string;
    password: string;
};
export type LoginResponse = {
    username: string;
    name: string;
    jobDesc?: string | null;
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
export type RoleListResponse = {
    roleId: string;
    roleName: string;
    roleLevel: number;
    isActive: boolean;
};
export declare function toUserResponse(user: User): UserResponse;
type LoginIdentity = Pick<User, "username" | "name"> & {
    jobDesc?: string | null;
};
export declare function toLoginResponse(user: LoginIdentity, token: string): LoginResponse;
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
export declare function toRoleListResponse(role: Role): RoleListResponse;
export {};
//# sourceMappingURL=user-model.d.ts.map