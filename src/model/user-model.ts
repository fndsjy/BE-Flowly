import type { User, Role } from "../generated/flowly/client.js";
import { getTokenExpiresIn } from "../utils/auth.js"; // sesuaikan path

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
  expiresIn: number; // dalam detik (misal: 10800 = 3 jam)
  expiresAt: string; // timestamp ISO saat token kedaluwarsa
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

export function toUserResponse(user: User): UserResponse {
  return {
    username: user.username,
    name: user.name,
  };
}

type LoginIdentity = Pick<User, "username" | "name"> & { jobDesc?: string | null };

export function toLoginResponse(user: LoginIdentity, token: string): LoginResponse {
  const expiresIn = getTokenExpiresIn(token); // dalam detik
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toLocaleString();
  return {
    username: user.username,
    name: user.name,
    jobDesc: user.jobDesc ?? null,
    token,
    expiresIn,
    expiresAt,
  };
}

export function toUserProfileResponse(user: User & { role: { roleName: string; roleLevel: number } }): UserProfileResponse {
  return {
    userId: user.userId,
    username: user.username,
    name: user.name,
    badgeNumber: user.badgeNumber,
    department: user.department,
    roleId: user.roleId,
    roleName: user.role.roleName,
    roleLevel: user.role.roleLevel,
  };
}

export function toUserListResponse(user: User & { role: { roleName: string } }): UserListResponse {
  return {
    userId: user.userId,
    username: user.username,
    name: user.name,
    badgeNumber: user.badgeNumber,
    department: user.department,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    roleName: user.role.roleName,
    createdAt: user.createdAt,
  };
}

export function toRoleListResponse(role: Role): RoleListResponse {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    roleLevel: role.roleLevel,
    isActive: role.roleIsActive
  };
}
