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
        jobDesc: user.jobDesc ?? null,
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
        departmentId: null,
        employeeUserId: null,
        roleId: user.roleId,
        roleName: user.role.roleName,
        roleLevel: user.role.roleLevel,
        gender: null,
        nik: null,
        birthDay: null,
        religion: null,
        hireDay: null,
        street: null,
        city: null,
        state: null,
        email: null,
        phone: null,
        isMem: null,
        isMemDate: null,
        imgName: null,
        tipe: null,
        location: null,
        statusLMS: false,
        bpjsKesehatan: null,
        bpjsKetenagakerjaan: null,
        canEditProfile: false,
        canEditAllProfileFields: false,
        canEditProfilePhoto: false,
        canChangePassword: true,
        editableFields: [],
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