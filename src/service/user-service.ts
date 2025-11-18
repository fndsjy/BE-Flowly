// user-service.ts
import { toUserResponse, toLoginResponse, toUserProfileResponse, toUserListResponse, type CreateUserRequest, type UserResponse, type LoginRequest, type LoginResponse, type ChangePasswordRequest, type ChangeRoleRequest, type UserProfileResponse, type UserListResponse } from "../model/user-model.js";
import { UserValidation } from "../validation/user-validation.js";
import { Validation } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import { getTokenExpiresIn, generateToken, verifyToken } from "../utils/auth.js";
import { generateUserId } from "../utils/id-generator.js";

export class UserService {
  // ✅ Register (with generated userId)
  static async register(request: CreateUserRequest, requesterUserId: string): Promise<UserResponse> {
    const registerRequest = Validation.validate(UserValidation.REGISTER, request);

    // ✅ Check requester role
    const requester = await prismaClient.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only Admin can register new users");
    }

    const existing = await prismaClient.user.findUnique({
      where: { username: registerRequest.username }
    });
    if (existing) {
      throw new ResponseError(400, "Username already taken");
    }

    // ✅ Determine role
  let roleToAssign;
  if (registerRequest.roleId) {
    // Admin explicitly selected a role
    roleToAssign = await prismaClient.role.findUnique({
      where: { roleId: registerRequest.roleId, roleIsActive: true }
    });
    if (!roleToAssign) {
      throw new ResponseError(400, "Selected role is invalid or inactive");
    }
  } else {
    // Use default role (level 4)
    roleToAssign = await prismaClient.role.findFirst({
      where: { roleLevel: 4, roleIsActive: true }
    });
    if (!roleToAssign) {
      throw new ResponseError(500, "Default role (level 4) not found");
    }
  }

  // ✅ Badge number — already validated as non-empty via Zod, but double-check:
  const badgeNumber = registerRequest.badgeNumber.trim();
  if (!badgeNumber) {
    throw new ResponseError(400, "Badge number is required");
  }

    // ✅ Generate userId
    const userId = await generateUserId();

    const hashed = await bcrypt.hash(registerRequest.password, 10);
    const user = await prismaClient.user.create({
      data: {
        userId, // ✅ Required field (from your Prisma schema)
        ...registerRequest,
        password: hashed,
        roleId: roleToAssign.roleId,
        badgeNumber,
        createdBy: requesterUserId,
        updatedBy: requesterUserId,
        isActive: true,
        isDeleted: false,
      }
    });

    return toUserResponse(user);
  }

  // ✅ Login — no change needed (no create/update raw object)
  static async login(request: LoginRequest): Promise<LoginResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const user = await prismaClient.user.findUnique({
      where: { username: loginRequest.username, isDeleted: false },
      include: { role: true }
    });
    if (!user || !user.isActive) {
      throw new ResponseError(401, "User not found or inactive");
    }

    const valid = await bcrypt.compare(loginRequest.password, user.password);
    if (!valid) {
      throw new ResponseError(401, "Invalid username or password");
    }

    let token = user.token;
    let expiresIn = 0;

    // Check if existing token exists and is still valid
    if (token) {
      expiresIn = getTokenExpiresIn(token);
      if (expiresIn <= 0) {
        // Token expired or invalid → discard and generate new one
        token = null;
      }
    }

    // If no valid token, generate a new one
    if (!token) {
      token = generateToken(user);
      expiresIn = 3 * 60 * 60;
      // expiresIn = 3 * 60 * 60; // 3 hours in seconds (since getTokenExpiresIn() gives seconds)

      // Update DB with new token and lastLogin
      await prismaClient.user.update({
        where: { userId: user.userId },
        data: {
          token,
          lastLogin: new Date(),
          // ✅ Set updatedBy to 'login system' as per your requirement
          // updatedBy: "login system",
        }
      });
    }

    return toLoginResponse(user, token);
  }

  // ✅ Get Profile — no change needed
  static async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await prismaClient.user.findUnique({
      where: { userId, isDeleted: false },
      include: { role: { select: { roleName: true, roleLevel: true } } }
    });
    if (!user) throw new ResponseError(404, "User not found");
    return toUserProfileResponse(user);
  }

  // ✅ List Users — no change needed
  static async listUsers(requesterUserId: string): Promise<UserListResponse[]> {
    const requester = await prismaClient.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Access denied");
    }

    const users = await prismaClient.user.findMany({
      where: { isDeleted: false },
      include: { role: { select: { roleName: true } } },
      orderBy: { createdAt: "desc" }
    });

    return users.map(toUserListResponse);
  }

  // ✅ Change Password — fix missing `data:`
  static async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    const changeReq = Validation.validate(UserValidation.CHANGE_PASSWORD, request);

    // 1. Find user
    const user = await prismaClient.user.findUnique({ where: { userId } });
    if (!user) throw new ResponseError(404, "User not found");

    // 2. Verify old password
    const isOldPasswordCorrect = await bcrypt.compare(changeReq.oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      throw new ResponseError(400, "Old password is incorrect");
    }

    // 3. Prevent reusing the same password
    if (changeReq.newPassword === changeReq.oldPassword) {
      throw new ResponseError(400, "New password must be different from the old password");
    }

    const hashed = await bcrypt.hash(changeReq.newPassword, 10);
    await prismaClient.user.update({
      where: { userId },
      data: { // ✅ Added `data:`
        password: hashed,
        updatedBy: userId
      }
    });
  }

  // ✅ Change Role — fix missing `data:`
  static async changeRole(requesterUserId: string, request: ChangeRoleRequest): Promise<void> {
    const changeReq = Validation.validate(UserValidation.CHANGE_ROLE, request);

    const requester = await prismaClient.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can change roles");
    }

    const targetUser = await prismaClient.user.findUnique({ where: { userId: changeReq.userId }, select: { userId: true, roleId: true } });
    if (!targetUser) throw new ResponseError(404, "User not found");

    if (targetUser.roleId === changeReq.newRoleId) {
      throw new ResponseError(400, "User already has this role");
    }

    const newRole = await prismaClient.role.findUnique({
      where: { roleId: changeReq.newRoleId, roleIsActive: true }
    });
    if (!newRole) throw new ResponseError(400, "Invalid or inactive role");

    await prismaClient.user.update({
      where: { userId: changeReq.userId },
      data: { // ✅ Added `data:`
        roleId: newRole.roleId,
        updatedBy: requesterUserId
      }
    });
  }
}