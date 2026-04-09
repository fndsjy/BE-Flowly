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
    identity?: string;
    username?: string;
    email?: string;
    cardNo?: string;
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
export type UpdateProfileRequest = {
    name?: string;
    badgeNumber?: string;
    gender?: string;
    nik?: string;
    birthDay?: Date;
    religion?: string;
    hireDay?: Date;
    street?: string | null;
    city?: string | null;
    state?: string;
    email?: string | null;
    phone?: string | null;
    departmentId?: number | null;
    isMem?: boolean | null;
    isMemDate?: Date | null;
    imgName?: string | null;
    tipe?: string;
    location?: string;
    statusLMS?: boolean;
    bpjsKesehatan?: string | null;
    bpjsKetenagakerjaan?: string | null;
};
export type ChangeRoleRequest = {
    userId: string;
    newRoleId: string;
};
export type UserProfileResponse = {
    userId: string;
    username: string;
    name: string;
    badgeNumber: string | null;
    department: string | null;
    departmentId: number | null;
    employeeUserId: number | null;
    roleId: string;
    roleName: string;
    roleLevel: number;
    gender: string | null;
    nik: string | null;
    birthDay: Date | null;
    religion: string | null;
    hireDay: Date | null;
    street: string | null;
    city: string | null;
    state: string | null;
    email: string | null;
    phone: string | null;
    isMem: boolean | null;
    isMemDate: Date | null;
    imgName: string | null;
    tipe: string | null;
    location: string | null;
    statusLMS: boolean;
    bpjsKesehatan: string | null;
    bpjsKetenagakerjaan: string | null;
    canEditProfile: boolean;
    canEditAllProfileFields: boolean;
    canEditProfilePhoto: boolean;
    canChangePassword: boolean;
    editableFields: string[];
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