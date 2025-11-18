export function toUserResponse(user) {
    return {
        username: user.username,
        name: user.name,
    };
}
export function toLoginResponse(user, token) {
    return {
        username: user.username,
        name: user.name,
        token,
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
//# sourceMappingURL=user-model.js.map