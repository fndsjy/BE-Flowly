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

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  username: string;
  name: string;
  token: string;
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

export function toUserResponse(user: User): UserResponse {
  return {
    username: user.username,
    name: user.name,
  };
}

export function toLoginResponse(user: User, token: string): LoginResponse {
  return {
    username: user.username,
    name: user.name,
    token,
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