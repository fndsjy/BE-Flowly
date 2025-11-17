import { type CreateUserRequest, type UserResponse, type LoginRequest, type LoginResponse, type ChangePasswordRequest, type ChangeRoleRequest, type UserProfileResponse, type UserListResponse } from "../model/user-model.js";
export declare class UserService {
    static register(request: CreateUserRequest, requesterUserId: string): Promise<UserResponse>;
    static login(request: LoginRequest): Promise<LoginResponse>;
    static getProfile(userId: string): Promise<UserProfileResponse>;
    static listUsers(requesterUserId: string): Promise<UserListResponse[]>;
    static changePassword(userId: string, request: ChangePasswordRequest): Promise<void>;
    static changeRole(requesterUserId: string, request: ChangeRoleRequest): Promise<void>;
}
//# sourceMappingURL=user-service.d.ts.map