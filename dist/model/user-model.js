import { getTokenExpiresIn } from "../utils/auth.js"; // sesuaikan path
export function toUserResponse(user) {
    return {
        username: user.username,
        name: user.name,
    };
}
export function toLoginResponse(user, token) {
    const expiresIn = getTokenExpiresIn(token); // dalam detik
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toLocaleString();
    return {
        username: user.username,
        name: user.name,
        token,
        expiresIn,
        expiresAt,
    };
}
export function toUserProfileResponse(user) {
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
export function toUserListResponse(user) {
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
export function toRoleListResponse(role) {
    return {
        roleId: role.roleId,
        roleName: role.roleName,
        roleLevel: role.roleLevel,
        isActive: role.roleIsActive
    };
}
//# sourceMappingURL=user-model.js.map