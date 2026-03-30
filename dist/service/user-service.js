import bcrypt from "bcrypt";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { toLoginResponse, toUserListResponse, toUserResponse, } from "../model/user-model.js";
import { generateToken, getTokenExpiresIn } from "../utils/auth.js";
import { generateUserId } from "../utils/id-generator.js";
import { UserValidation } from "../validation/user-validation.js";
import { Validation } from "../validation/validation.js";
const SELF_EDITABLE_PROFILE_FIELDS = [
    "street",
    "city",
    "email",
    "phone",
];
const ADMIN_EDITABLE_PROFILE_FIELDS = [
    ...SELF_EDITABLE_PROFILE_FIELDS,
    "name",
    "badgeNumber",
    "gender",
    "nik",
    "birthDay",
    "religion",
    "hireDay",
    "state",
    "departmentId",
    "isMem",
    "isMemDate",
    "imgName",
    "tipe",
    "location",
    "statusLMS",
    "bpjsKesehatan",
    "bpjsKetenagakerjaan",
];
const employeeProfileSelect = {
    UserId: true,
    BadgeNum: true,
    Name: true,
    Gender: true,
    BirthDay: true,
    HireDay: true,
    Street: true,
    Religion: true,
    Tipe: true,
    isLokasi: true,
    Phone: true,
    DeptId: true,
    Password: true,
    isMem: true,
    isMemDate: true,
    ImgName: true,
    Nik: true,
    city: true,
    state: true,
    email: true,
    BPJSKshtn: true,
    BPJSKtngkerjaan: true,
    statusLMS: true,
    roleId: true,
};
const normalizeOptionalText = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
const normalizeProfileEmail = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    const trimmed = value.trim();
    return trimmed && trimmed !== "-" ? trimmed : null;
};
const getEditableProfileFields = (isAdmin, hasEmployeeProfile) => {
    if (!hasEmployeeProfile) {
        return [];
    }
    return isAdmin
        ? [...ADMIN_EDITABLE_PROFILE_FIELDS]
        : [...SELF_EDITABLE_PROFILE_FIELDS];
};
const findDepartmentName = async (departmentId) => {
    if (departmentId === undefined || departmentId === null) {
        return null;
    }
    const department = await prismaEmployee.em_dept.findUnique({
        where: { DEPTID: departmentId },
        select: { DEPTNAME: true },
    });
    return department?.DEPTNAME ?? null;
};
const ensureDepartmentExists = async (departmentId) => {
    if (departmentId === undefined || departmentId === null) {
        return;
    }
    const department = await prismaEmployee.em_dept.findUnique({
        where: { DEPTID: departmentId },
        select: { DEPTID: true },
    });
    if (!department) {
        throw new ResponseError(400, "Department not found");
    }
};
const ensureUniqueEmployeeBadgeNumber = async (badgeNumber, excludeUserId) => {
    const existing = await prismaEmployee.em_employee.findFirst({
        where: {
            BadgeNum: badgeNumber,
            ...(excludeUserId ? { UserId: { not: excludeUserId } } : {}),
        },
        select: { UserId: true },
    });
    if (existing) {
        throw new ResponseError(400, "Badge number already used by another employee");
    }
};
const findEmployeeByUserId = async (employeeUserId) => {
    const employee = await prismaEmployee.em_employee.findUnique({
        where: { UserId: employeeUserId },
        select: employeeProfileSelect,
    });
    return employee;
};
const findEmployeeByBadgeNumber = async (badgeNumber) => {
    const normalized = badgeNumber?.trim();
    if (!normalized) {
        return null;
    }
    const employee = await prismaEmployee.em_employee.findFirst({
        where: { BadgeNum: normalized },
        select: employeeProfileSelect,
    });
    return employee;
};
const findFlowlyUserById = async (userId) => {
    const user = await prismaFlowly.user.findUnique({
        where: { userId },
        include: {
            role: {
                select: {
                    roleName: true,
                    roleLevel: true,
                },
            },
        },
    });
    if (!user || user.isDeleted) {
        return null;
    }
    return user;
};
const resolveProfileContext = async (userId) => {
    const flowlyUser = await findFlowlyUserById(userId);
    if (flowlyUser) {
        const employee = await findEmployeeByBadgeNumber(flowlyUser.badgeNumber);
        return {
            flowlyUser,
            employee,
            roleId: flowlyUser.roleId,
            roleName: flowlyUser.role.roleName,
            roleLevel: flowlyUser.role.roleLevel,
            userId: flowlyUser.userId,
            username: flowlyUser.username,
            name: employee?.Name ?? flowlyUser.name,
            badgeNumber: employee?.BadgeNum ?? flowlyUser.badgeNumber,
            department: flowlyUser.department,
        };
    }
    const employeeUserId = Number(userId);
    if (Number.isNaN(employeeUserId)) {
        throw new ResponseError(404, "User not found");
    }
    const employee = await findEmployeeByUserId(employeeUserId);
    if (!employee) {
        throw new ResponseError(404, "User not found");
    }
    const username = employee.BadgeNum?.trim() || String(employee.UserId);
    const name = employee.Name ?? username;
    return {
        flowlyUser: null,
        employee,
        roleId: employee.roleId !== null && employee.roleId !== undefined
            ? String(employee.roleId)
            : "EMPLOYEE",
        roleName: "Employee",
        roleLevel: 4,
        userId: String(employee.UserId),
        username,
        name,
        badgeNumber: employee.BadgeNum ?? null,
        department: null,
    };
};
const toProfileResponse = async (context) => {
    const { employee, roleLevel } = context;
    const isAdmin = roleLevel === 1;
    const departmentName = employee?.DeptId !== null && employee?.DeptId !== undefined
        ? await findDepartmentName(employee.DeptId)
        : context.department;
    return {
        userId: context.userId,
        username: context.username,
        name: employee?.Name ?? context.name,
        badgeNumber: employee?.BadgeNum ?? context.badgeNumber ?? null,
        department: departmentName ?? null,
        departmentId: employee?.DeptId ?? null,
        employeeUserId: employee?.UserId ?? null,
        roleId: context.roleId,
        roleName: context.roleName,
        roleLevel: context.roleLevel,
        gender: employee?.Gender ?? null,
        nik: employee?.Nik ?? null,
        birthDay: employee?.BirthDay ?? null,
        religion: employee?.Religion ?? null,
        hireDay: employee?.HireDay ?? null,
        street: employee?.Street ?? null,
        city: employee?.city ?? null,
        state: employee?.state ?? null,
        email: normalizeProfileEmail(employee?.email),
        phone: employee?.Phone ?? null,
        isMem: employee?.isMem ?? null,
        isMemDate: employee?.isMemDate ?? null,
        imgName: employee?.ImgName ?? null,
        tipe: employee?.Tipe ?? null,
        location: employee?.isLokasi ?? null,
        statusLMS: employee?.statusLMS ?? false,
        bpjsKesehatan: employee?.BPJSKshtn ?? null,
        bpjsKetenagakerjaan: employee?.BPJSKtngkerjaan ?? null,
        canEditProfile: Boolean(employee),
        canEditAllProfileFields: Boolean(employee) && isAdmin,
        canEditProfilePhoto: Boolean(employee) && isAdmin,
        canChangePassword: true,
        editableFields: getEditableProfileFields(isAdmin, Boolean(employee)),
    };
};
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
export class UserService {
    static async register(request, requesterUserId) {
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true },
        });
        if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only Admin can register new users");
        }
        const existing = await prismaFlowly.user.findUnique({
            where: { username: registerRequest.username },
        });
        if (existing) {
            throw new ResponseError(400, "Username already taken");
        }
        let roleToAssign;
        if (registerRequest.roleId) {
            roleToAssign = await prismaFlowly.role.findUnique({
                where: { roleId: registerRequest.roleId, roleIsActive: true },
            });
            if (!roleToAssign) {
                throw new ResponseError(400, "Selected role is invalid or inactive");
            }
        }
        else {
            roleToAssign = await prismaFlowly.role.findFirst({
                where: { roleLevel: 4, roleIsActive: true },
            });
            if (!roleToAssign) {
                throw new ResponseError(500, "Default role (level 4) not found");
            }
        }
        const badgeNumber = registerRequest.badgeNumber.trim();
        if (!badgeNumber) {
            throw new ResponseError(400, "Badge number is required");
        }
        const userId = await generateUserId();
        const hashed = await bcrypt.hash(registerRequest.password, 10);
        const user = await prismaFlowly.user.create({
            data: {
                userId,
                ...registerRequest,
                password: hashed,
                roleId: roleToAssign.roleId,
                badgeNumber,
                createdBy: requesterUserId,
                updatedBy: requesterUserId,
                isActive: true,
                isDeleted: false,
            },
        });
        return toUserResponse(user);
    }
    static async login(request) {
        const loginRequest = Validation.validate(UserValidation.LOGIN, request);
        if (loginRequest.username) {
            const user = await prismaFlowly.user.findUnique({
                where: { username: loginRequest.username },
                include: { role: true },
            });
            if (!user || user.isDeleted || !user.isActive) {
                throw new ResponseError(401, "User not found or inactive");
            }
            const valid = await bcrypt.compare(loginRequest.password, user.password);
            if (!valid) {
                throw new ResponseError(401, "Invalid username or password");
            }
            let token = user.token;
            let expiresIn = 0;
            if (token) {
                expiresIn = getTokenExpiresIn(token);
                if (expiresIn <= 0) {
                    token = null;
                }
            }
            if (!token) {
                token = generateToken(user);
                expiresIn = 3 * 60 * 60;
                await prismaFlowly.user.update({
                    where: { userId: user.userId },
                    data: {
                        token,
                        lastLogin: new Date(),
                    },
                });
            }
            return toLoginResponse(user, token);
        }
        const cardNo = loginRequest.cardNo?.trim();
        if (!cardNo) {
            throw new ResponseError(400, "Card number is required");
        }
        const employee = await prismaEmployee.em_employee.findFirst({
            where: { CardNo: cardNo },
            select: {
                UserId: true,
                BadgeNum: true,
                CardNo: true,
                Name: true,
                Password: true,
                roleId: true,
                jobDesc: true,
            },
        });
        if (!employee || !employee.Password) {
            throw new ResponseError(401, "Invalid card number");
        }
        const isPasswordValid = await UserService.isEmployeePasswordValid(loginRequest.password, employee.Password);
        if (!isPasswordValid) {
            throw new ResponseError(401, "Invalid card number or password");
        }
        const employeeUsername = employee.CardNo?.trim() || cardNo;
        const token = generateToken({
            userId: String(employee.UserId),
            username: employeeUsername,
            roleId: String(employee.roleId ?? "EMPLOYEE"),
        });
        return toLoginResponse({
            username: employeeUsername,
            name: employee.Name ?? employeeUsername,
            jobDesc: employee.jobDesc ?? null,
        }, token);
    }
    static async isEmployeePasswordValid(password, storedPassword) {
        const normalized = storedPassword.trim();
        const bcryptHash = normalized.startsWith("$2y$")
            ? `$2b$${normalized.slice(4)}`
            : normalized;
        try {
            return await bcrypt.compare(password, bcryptHash);
        }
        catch {
            return password === normalized;
        }
    }
    static async getProfile(userId) {
        const context = await resolveProfileContext(userId);
        return toProfileResponse(context);
    }
    static async updateProfile(requesterUserId, request) {
        const validated = Validation.validate(UserValidation.UPDATE_PROFILE, request);
        const providedKeys = Object.entries(request)
            .filter(([, value]) => value !== undefined)
            .map(([key]) => key);
        if (providedKeys.length === 0) {
            throw new ResponseError(400, "No profile changes were provided");
        }
        const context = await resolveProfileContext(requesterUserId);
        if (!context.employee) {
            throw new ResponseError(404, "Employee profile not found");
        }
        const isAdmin = context.roleLevel === 1;
        const allowedFields = new Set(getEditableProfileFields(isAdmin, true));
        const unauthorizedFields = providedKeys.filter((key) => !allowedFields.has(key));
        if (unauthorizedFields.length > 0) {
            throw new ResponseError(403, `You are not allowed to update: ${unauthorizedFields.join(", ")}`);
        }
        if (validated.departmentId !== undefined) {
            await ensureDepartmentExists(validated.departmentId);
        }
        if (validated.badgeNumber !== undefined &&
            validated.badgeNumber.trim() !== context.employee.BadgeNum) {
            await ensureUniqueEmployeeBadgeNumber(validated.badgeNumber.trim(), context.employee.UserId);
        }
        const employeeUpdateData = {
            Lastupdate: new Date(),
        };
        if (validated.name !== undefined) {
            employeeUpdateData.Name = validated.name.trim();
        }
        if (validated.badgeNumber !== undefined) {
            const badgeNumber = validated.badgeNumber.trim();
            employeeUpdateData.BadgeNum = badgeNumber;
            employeeUpdateData.CardNo = badgeNumber;
        }
        if (validated.gender !== undefined) {
            employeeUpdateData.Gender = validated.gender.trim();
        }
        if (validated.nik !== undefined) {
            employeeUpdateData.Nik = validated.nik.trim();
        }
        if (validated.birthDay !== undefined) {
            employeeUpdateData.BirthDay = validated.birthDay;
        }
        if (validated.religion !== undefined) {
            employeeUpdateData.Religion = validated.religion.trim();
        }
        if (validated.hireDay !== undefined) {
            employeeUpdateData.HireDay = validated.hireDay;
        }
        if (validated.street !== undefined) {
            employeeUpdateData.Street = normalizeOptionalText(validated.street);
        }
        if (validated.city !== undefined) {
            employeeUpdateData.city = normalizeOptionalText(validated.city);
        }
        if (validated.state !== undefined) {
            employeeUpdateData.state = validated.state.trim();
        }
        if (validated.email !== undefined) {
            employeeUpdateData.email = normalizeOptionalText(validated.email);
        }
        if (validated.phone !== undefined) {
            employeeUpdateData.Phone = normalizeOptionalText(validated.phone);
        }
        if (validated.departmentId !== undefined) {
            employeeUpdateData.DeptId = validated.departmentId;
        }
        if (validated.imgName !== undefined) {
            employeeUpdateData.ImgName = normalizeOptionalText(validated.imgName);
        }
        if (validated.tipe !== undefined) {
            employeeUpdateData.Tipe = validated.tipe.trim();
        }
        if (validated.location !== undefined) {
            employeeUpdateData.isLokasi = validated.location.trim();
        }
        if (validated.statusLMS !== undefined) {
            employeeUpdateData.statusLMS = validated.statusLMS;
        }
        if (validated.bpjsKesehatan !== undefined) {
            employeeUpdateData.BPJSKshtn = normalizeOptionalText(validated.bpjsKesehatan);
        }
        if (validated.bpjsKetenagakerjaan !== undefined) {
            employeeUpdateData.BPJSKtngkerjaan = normalizeOptionalText(validated.bpjsKetenagakerjaan);
        }
        const isMemSubmitted = hasOwn(validated, "isMem") || hasOwn(validated, "isMemDate");
        if (isMemSubmitted) {
            const nextIsMem = validated.isMem ?? context.employee.isMem ?? false;
            const nextIsMemDate = nextIsMem
                ? hasOwn(validated, "isMemDate")
                    ? validated.isMemDate ?? null
                    : context.employee.isMemDate ?? null
                : null;
            if (nextIsMem && !nextIsMemDate) {
                throw new ResponseError(400, "Tanggal hafal ibadah wajib diisi saat status hafal ibadah aktif");
            }
            employeeUpdateData.isMem = nextIsMem;
            employeeUpdateData.isMemDate = nextIsMemDate;
        }
        await prismaEmployee.em_employee.update({
            where: { UserId: context.employee.UserId },
            data: employeeUpdateData,
        });
        const shouldSyncFlowlyUser = context.flowlyUser &&
            (validated.name !== undefined ||
                validated.badgeNumber !== undefined ||
                validated.departmentId !== undefined);
        if (context.flowlyUser && shouldSyncFlowlyUser) {
            const flowlyUserUpdateData = {
                updatedBy: requesterUserId,
            };
            if (validated.name !== undefined) {
                flowlyUserUpdateData.name = validated.name.trim();
            }
            if (validated.badgeNumber !== undefined) {
                flowlyUserUpdateData.badgeNumber = validated.badgeNumber.trim();
            }
            if (validated.departmentId !== undefined) {
                flowlyUserUpdateData.department = await findDepartmentName(validated.departmentId);
            }
            await prismaFlowly.user.update({
                where: { userId: context.flowlyUser.userId },
                data: flowlyUserUpdateData,
            });
        }
        return this.getProfile(requesterUserId);
    }
    static async listUsers(requesterUserId) {
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true },
        });
        if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Access denied");
        }
        const users = await prismaFlowly.user.findMany({
            where: { isDeleted: false },
            include: { role: { select: { roleName: true } } },
            orderBy: { createdAt: "desc" },
        });
        return users.map(toUserListResponse);
    }
    static async changePassword(userId, request) {
        const changeReq = Validation.validate(UserValidation.CHANGE_PASSWORD, request);
        const flowlyUser = await prismaFlowly.user.findUnique({
            where: { userId },
        });
        if (flowlyUser && !flowlyUser.isDeleted) {
            const isOldPasswordCorrect = await bcrypt.compare(changeReq.oldPassword, flowlyUser.password);
            if (!isOldPasswordCorrect) {
                throw new ResponseError(400, "Old password is incorrect");
            }
            if (changeReq.newPassword === changeReq.oldPassword) {
                throw new ResponseError(400, "New password must be different from the old password");
            }
            const hashed = await bcrypt.hash(changeReq.newPassword, 10);
            await prismaFlowly.user.update({
                where: { userId },
                data: {
                    password: hashed,
                    updatedBy: userId,
                },
            });
            return;
        }
        const employeeUserId = Number(userId);
        if (Number.isNaN(employeeUserId)) {
            throw new ResponseError(404, "User not found");
        }
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: employeeUserId },
            select: {
                UserId: true,
                Password: true,
            },
        });
        if (!employee || !employee.Password) {
            throw new ResponseError(404, "User not found");
        }
        const isOldPasswordCorrect = await this.isEmployeePasswordValid(changeReq.oldPassword, employee.Password);
        if (!isOldPasswordCorrect) {
            throw new ResponseError(400, "Old password is incorrect");
        }
        if (changeReq.newPassword === changeReq.oldPassword) {
            throw new ResponseError(400, "New password must be different from the old password");
        }
        const hashed = await bcrypt.hash(changeReq.newPassword, 10);
        await prismaEmployee.em_employee.update({
            where: { UserId: employeeUserId },
            data: {
                Password: hashed,
                Lastupdate: new Date(),
            },
        });
    }
    static async changeRole(requesterUserId, request) {
        const changeReq = Validation.validate(UserValidation.CHANGE_ROLE, request);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true },
        });
        if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can change roles");
        }
        const targetUser = await prismaFlowly.user.findUnique({
            where: { userId: changeReq.userId },
            select: { userId: true, roleId: true, isDeleted: true },
        });
        if (!targetUser || targetUser.isDeleted) {
            throw new ResponseError(404, "User not found");
        }
        if (targetUser.roleId === changeReq.newRoleId) {
            throw new ResponseError(400, "User already has this role");
        }
        const newRole = await prismaFlowly.role.findUnique({
            where: { roleId: changeReq.newRoleId, roleIsActive: true },
        });
        if (!newRole) {
            throw new ResponseError(400, "Invalid or inactive role");
        }
        await prismaFlowly.user.update({
            where: { userId: changeReq.userId },
            data: {
                roleId: newRole.roleId,
                updatedBy: requesterUserId,
            },
        });
    }
    static async listRoles(requesterUserId) {
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true },
        });
        if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can access roles");
        }
        const roles = await prismaFlowly.role.findMany({
            where: { roleIsActive: true },
            orderBy: { roleLevel: "asc" },
        });
        return roles.map((role) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            roleLevel: role.roleLevel,
            isActive: role.roleIsActive,
        }));
    }
}
//# sourceMappingURL=user-service.js.map