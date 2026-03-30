import { type ChangePasswordRequest, type ChangeRoleRequest, type CreateUserRequest, type LoginRequest, type LoginResponse, type UpdateProfileRequest, type UserListResponse, type UserProfileResponse, type UserResponse } from "../model/user-model.js";
export declare class UserService {
    static register(request: CreateUserRequest, requesterUserId: string): Promise<UserResponse>;
    static login(request: LoginRequest): Promise<LoginResponse>;
    private static isEmployeePasswordValid;
    static getProfile(userId: string): Promise<UserProfileResponse>;
    static updateProfile(requesterUserId: string, request: UpdateProfileRequest): Promise<UserProfileResponse>;
    static listUsers(requesterUserId: string): Promise<UserListResponse[]>;
    static changePassword(userId: string, request: ChangePasswordRequest): Promise<void>;
    static changeRole(requesterUserId: string, request: ChangeRoleRequest): Promise<void>;
    static listRoles(requesterUserId: string): Promise<{
        roleId: string;
        roleName: string;
        roleLevel: number;
        isActive: boolean;
    }[]>;
}
//# sourceMappingURL=user-service.d.ts.map