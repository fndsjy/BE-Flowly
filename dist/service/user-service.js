// user-service.ts
import { toUserResponse, toLoginResponse, toUserProfileResponse, toUserListResponse } from "../model/user-model.js";
import { UserValidation } from "../validation/user-validation.js";
import { Validation } from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth.js";
import { generateUserId } from "../utils/id-generator.js";
export class UserService {
    // ✅ Register (with generated userId)
    static async register(request, requesterUserId) {
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);
        // ✅ Check requester role
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only Super Admin can register new users");
        }
        const existing = await prismaClient.user.findUnique({
            where: { username: registerRequest.username }
        });
        if (existing) {
            throw new ResponseError(400, "Username already taken");
        }
        // Get default role (level 3)
        const defaultRole = await prismaClient.role.findFirst({
            where: { roleLevel: 3, roleIsActive: true }
        });
        if (!defaultRole) {
            throw new ResponseError(500, "Default role not found");
        }
        // ✅ Generate userId
        const userId = await generateUserId();
        const hashed = await bcrypt.hash(registerRequest.password, 10);
        const user = await prismaClient.user.create({
            data: {
                userId, // ✅ Required field (from your Prisma schema)
                ...registerRequest,
                password: hashed,
                roleId: defaultRole.roleId,
                badgeNumber: `BDG-${Date.now().toString().slice(-6)}`,
                createdBy: requesterUserId,
                updatedBy: requesterUserId,
                // Pastikan field lain seperti isActive, isDeleted juga di-set jika required
                isActive: true,
                isDeleted: false,
            }
        });
        return toUserResponse(user);
    }
    // ✅ Login — no change needed (no create/update raw object)
    static async login(request) {
        const loginRequest = Validation.validate(UserValidation.LOGIN, request);
        const user = await prismaClient.user.findUnique({
            where: { username: loginRequest.username, isDeleted: false },
            include: { role: true }
        });
        if (!user || !user.isActive) {
            throw new ResponseError(401, "Invalid credentials");
        }
        const valid = await bcrypt.compare(loginRequest.password, user.password);
        if (!valid) {
            throw new ResponseError(401, "Invalid credentials");
        }
        await prismaClient.user.update({
            where: { userId: user.userId },
            data: {
                lastLogin: new Date(),
                updatedBy: user.userId
            }
        });
        const token = generateToken(user);
        return toLoginResponse(user, token);
    }
    // ✅ Get Profile — no change needed
    static async getProfile(userId) {
        const user = await prismaClient.user.findUnique({
            where: { userId, isDeleted: false },
            include: { role: { select: { roleName: true, roleLevel: true } } }
        });
        if (!user)
            throw new ResponseError(404, "User not found");
        return toUserProfileResponse(user);
    }
    // ✅ List Users — no change needed
    static async listUsers(requesterUserId) {
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel > 2) {
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
    static async changePassword(userId, request) {
        const changeReq = Validation.validate(UserValidation.CHANGE_PASSWORD, request);
        const user = await prismaClient.user.findUnique({ where: { userId } });
        if (!user)
            throw new ResponseError(404, "User not found");
        const valid = await bcrypt.compare(changeReq.oldPassword, user.password);
        if (!valid)
            throw new ResponseError(400, "Old password is incorrect");
        const hashed = await bcrypt.hash(changeReq.newPassword, 10);
        await prismaClient.user.update({
            where: { userId },
            data: {
                password: hashed,
                updatedBy: userId
            }
        });
    }
    // ✅ Change Role — fix missing `data:`
    static async changeRole(requesterUserId, request) {
        const changeReq = Validation.validate(UserValidation.CHANGE_ROLE, request);
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only Super Admin can change roles");
        }
        const targetUser = await prismaClient.user.findUnique({ where: { userId: changeReq.userId } });
        if (!targetUser)
            throw new ResponseError(404, "User not found");
        const newRole = await prismaClient.role.findUnique({
            where: { roleId: changeReq.newRoleId, roleIsActive: true }
        });
        if (!newRole)
            throw new ResponseError(400, "Invalid or inactive role");
        await prismaClient.user.update({
            where: { userId: changeReq.userId },
            data: {
                roleId: newRole.roleId,
                updatedBy: requesterUserId
            }
        });
    }
}
//# sourceMappingURL=user-service.js.map