import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { toEmployeeDepartmentResponse, toEmployeeResponse, } from "../model/employee-model.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { Validation } from "../validation/validation.js";
import { EmployeeValidation } from "../validation/employee-validation.js";
const employeeSelect = {
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
    CardNo: true,
    Shift: true,
    isMem: true,
    AddBy: true,
    isMemDate: true,
    isFirstLogin: true,
    ImgName: true,
    SbuSub: true,
    Nik: true,
    ResignDate: true,
    statusLMS: true,
    roleId: true,
    jobDesc: true,
    city: true,
    state: true,
    email: true,
    IPMsnFinger: true,
    BPJSKshtn: true,
    BPJSKtngkerjaan: true,
    Created_at: true,
    Lastupdate: true,
};
const EMPLOYEE_AUDIT_FIELDS = [
    "UserId",
    "BadgeNum",
    "Name",
    "Gender",
    "BirthDay",
    "HireDay",
    "DeptId",
    "Nik",
    "statusLMS",
    "jobDesc",
    "state",
    "email",
    "ResignDate",
];
const getEmployeeSnapshot = (record) => pickSnapshot(record, EMPLOYEE_AUDIT_FIELDS);
const normalizeOptionalText = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
const normalizeRequiredText = (value, fallback) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
};
const normalizeStatusLmsInput = (value) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return false;
    }
    return normalized === "1" || normalized === "true" || normalized === "yes";
};
const normalizeAccessLevel = (value) => {
    const upper = value.trim().toUpperCase();
    return upper === "FULL" ? "CRUD" : upper;
};
const toLegacyActorId = (value) => {
    const normalized = value.replace(/[^a-zA-Z0-9]/g, "").trim();
    return normalized ? normalized.slice(0, 5) : null;
};
const getDepartmentMap = async () => {
    const departments = await prismaEmployee.em_dept.findMany({
        select: {
            DEPTID: true,
            DEPTNAME: true,
        },
    });
    return new Map(departments.map((department) => [department.DEPTID, department.DEPTNAME ?? null]));
};
const withDepartmentName = async (employee) => {
    const deptName = employee.DeptId !== null && employee.DeptId !== undefined
        ? (await prismaEmployee.em_dept.findUnique({
            where: { DEPTID: employee.DeptId },
            select: { DEPTNAME: true },
        }))?.DEPTNAME ?? null
        : null;
    return toEmployeeResponse({
        ...employee,
        DeptName: deptName,
    });
};
const ensureDepartmentExists = async (deptId) => {
    if (deptId === undefined || deptId === null) {
        return;
    }
    const department = await prismaEmployee.em_dept.findUnique({
        where: { DEPTID: deptId },
        select: { DEPTID: true },
    });
    if (!department) {
        throw new ResponseError(400, "Department not found");
    }
};
const ensureUniqueBadgeNumber = async (badgeNum, excludeUserId) => {
    const existing = await prismaEmployee.em_employee.findFirst({
        where: {
            BadgeNum: badgeNum,
            ...(excludeUserId ? { UserId: { not: excludeUserId } } : {}),
        },
        select: { UserId: true },
    });
    if (existing) {
        throw new ResponseError(400, "Badge number already used by another employee");
    }
};
const ensureCanManageEmployees = async (requesterUserId) => {
    const requester = await prismaFlowly.user.findUnique({
        where: { userId: requesterUserId },
        include: { role: true },
    });
    if (!requester) {
        throw new ResponseError(401, "Unauthorized");
    }
    if (requester.role.roleLevel === 1) {
        return;
    }
    const masterMenu = await prismaFlowly.masterAccessRole.findUnique({
        where: {
            resourceType_resourceKey: {
                resourceType: "MENU",
                resourceKey: "HRD",
            },
        },
        select: { masAccessId: true },
    });
    const subjectFilters = [{ subjectType: "USER", subjectId: requesterUserId }];
    if (requester.roleId) {
        subjectFilters.unshift({ subjectType: "ROLE", subjectId: requester.roleId });
    }
    const accessRoles = await prismaFlowly.accessRole.findMany({
        where: {
            isDeleted: false,
            resourceType: "MENU",
            OR: subjectFilters,
            ...(masterMenu
                ? {
                    AND: [
                        {
                            OR: [{ resourceKey: "HRD" }, { masAccessId: masterMenu.masAccessId }],
                        },
                    ],
                }
                : { resourceKey: "HRD" }),
        },
        select: {
            subjectType: true,
            accessLevel: true,
            isActive: true,
        },
    });
    let finalLevel = null;
    const applyLevel = (level, override) => {
        const normalized = normalizeAccessLevel(level);
        if (normalized !== "READ" && normalized !== "CRUD") {
            return;
        }
        if (!finalLevel || override) {
            finalLevel = normalized;
            return;
        }
        if (finalLevel === "READ" && normalized === "CRUD") {
            finalLevel = normalized;
        }
    };
    for (const access of accessRoles.filter((item) => item.subjectType === "ROLE")) {
        if (!access.isActive) {
            continue;
        }
        applyLevel(access.accessLevel, false);
    }
    for (const access of accessRoles.filter((item) => item.subjectType === "USER")) {
        if (!access.isActive) {
            finalLevel = null;
            continue;
        }
        applyLevel(access.accessLevel, true);
    }
    if (finalLevel !== "CRUD") {
        throw new ResponseError(403, "Menu HRD CRUD access required");
    }
};
const buildEmployeeCreateData = (request, requesterUserId) => {
    const now = new Date();
    const badgeNum = request.BadgeNum.trim();
    return {
        BadgeNum: badgeNum,
        Name: normalizeOptionalText(request.Name) ?? null,
        Gender: normalizeOptionalText(request.Gender) ?? null,
        BirthDay: request.BirthDay ?? null,
        HireDay: request.HireDay ?? null,
        Street: normalizeOptionalText(request.Street) ?? null,
        Religion: normalizeOptionalText(request.Religion) ?? null,
        Tipe: normalizeOptionalText(request.Tipe) ?? null,
        isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
        Phone: normalizeOptionalText(request.Phone) ?? null,
        DeptId: request.DeptId ?? null,
        CardNo: badgeNum,
        Shift: request.Shift ?? null,
        isMem: request.isMem ?? false,
        AddBy: toLegacyActorId(requesterUserId),
        Created_at: now,
        Lastupdate: now,
        isMemDate: request.isMem ? request.isMemDate ?? null : null,
        isFirstLogin: 0,
        ImgName: "domas.png",
        SbuSub: request.SbuSub ?? null,
        Nik: normalizeOptionalText(request.Nik) ?? null,
        ResignDate: request.ResignDate ?? null,
        status: "-",
        statusLMS: normalizeStatusLmsInput(request.statusLMS),
        roleId: request.roleId ?? null,
        jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
        city: normalizeOptionalText(request.city) ?? null,
        state: normalizeRequiredText(request.state, "Indonesia"),
        email: normalizeOptionalText(request.email) ?? null,
        IPMsnFinger: normalizeRequiredText(request.IPMsnFinger, "-"),
        BPJSKshtn: normalizeOptionalText(request.BPJSKshtn) ?? null,
        BPJSKtngkerjaan: normalizeOptionalText(request.BPJSKtngkerjaan) ?? null,
    };
};
const buildEmployeeUpdateData = (request) => {
    const badgeNum = request.BadgeNum.trim();
    const data = {
        Lastupdate: new Date(),
        BadgeNum: badgeNum,
        Name: normalizeOptionalText(request.Name) ?? null,
        Gender: normalizeOptionalText(request.Gender) ?? null,
        BirthDay: request.BirthDay ?? null,
        HireDay: request.HireDay ?? null,
        Street: normalizeOptionalText(request.Street) ?? null,
        Religion: normalizeOptionalText(request.Religion) ?? null,
        Tipe: normalizeOptionalText(request.Tipe) ?? null,
        isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
        Phone: normalizeOptionalText(request.Phone) ?? null,
        DeptId: request.DeptId ?? null,
        CardNo: badgeNum,
        Shift: request.Shift ?? null,
        isMem: request.isMem ?? false,
        isMemDate: request.isMem ? request.isMemDate ?? null : null,
        SbuSub: request.SbuSub ?? null,
        Nik: normalizeOptionalText(request.Nik) ?? null,
        ResignDate: request.ResignDate ?? null,
        statusLMS: normalizeStatusLmsInput(request.statusLMS),
        roleId: request.roleId ?? null,
        jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
        city: normalizeOptionalText(request.city) ?? null,
        state: normalizeRequiredText(request.state, "Indonesia"),
        email: normalizeOptionalText(request.email) ?? null,
        IPMsnFinger: normalizeRequiredText(request.IPMsnFinger, "-"),
        BPJSKshtn: normalizeOptionalText(request.BPJSKshtn) ?? null,
        BPJSKtngkerjaan: normalizeOptionalText(request.BPJSKtngkerjaan) ?? null,
    };
    return data;
};
const ensureEmployeeCanBeDeleted = async (userId) => {
    const [chartMemberCount, caseRequesterCount, caseFeedbackApproverCount, caseAssigneeCount, caseAssigneeMemberCount, notificationOutboxCount, notificationMessageCount, pdcaOwnerCount, feedbackCommentCount, pilarPicCount, sbuPicCount, sbuSubPicCount,] = await Promise.all([
        prismaFlowly.chartMember.count({
            where: {
                userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseHeader.count({
            where: {
                requesterEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseHeader.count({
            where: {
                feedbackApprovedByEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseDepartment.count({
            where: {
                assigneeEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseDepartmentAssignee.count({
            where: {
                employeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseNotificationOutbox.count({
            where: {
                recipientEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseNotificationMessage.count({
            where: {
                recipientEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.casePdcaItem.count({
            where: {
                ownerEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaFlowly.caseFeedbackComment.count({
            where: {
                commenterEmployeeId: userId,
                isDeleted: false,
            },
        }),
        prismaEmployee.em_pilar.count({
            where: {
                pic: userId,
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
        }),
        prismaEmployee.em_sbu.count({
            where: {
                pic: userId,
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
        }),
        prismaEmployee.em_sbu_sub.count({
            where: {
                pic: userId,
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
        }),
    ]);
    const references = [
        { label: "chart member", count: chartMemberCount },
        { label: "case requester", count: caseRequesterCount },
        { label: "case feedback approver", count: caseFeedbackApproverCount },
        { label: "case department assignee", count: caseAssigneeCount },
        { label: "case department assignee member", count: caseAssigneeMemberCount },
        { label: "case notification outbox", count: notificationOutboxCount },
        { label: "case notification message", count: notificationMessageCount },
        { label: "case PDCA owner", count: pdcaOwnerCount },
        { label: "case feedback comment", count: feedbackCommentCount },
        { label: "pilar PIC", count: pilarPicCount },
        { label: "SBU PIC", count: sbuPicCount },
        { label: "SBU Sub PIC", count: sbuSubPicCount },
    ].filter((item) => item.count > 0);
    if (references.length > 0) {
        throw new ResponseError(400, `Employee cannot be deleted because it is still used in ${references
            .map((item) => `${item.label} (${item.count})`)
            .join(", ")}`);
    }
};
export class EmployeeService {
    static async listForPIC() {
        const [employees, departmentMap] = await Promise.all([
            prismaEmployee.em_employee.findMany({
                select: employeeSelect,
                orderBy: [{ Name: "asc" }, { BadgeNum: "asc" }],
            }),
            getDepartmentMap(),
        ]);
        return employees.map((employee) => toEmployeeResponse({
            ...employee,
            DeptName: employee.DeptId !== null && employee.DeptId !== undefined
                ? departmentMap.get(employee.DeptId) ?? null
                : null,
        }));
    }
    static async listDepartments() {
        const departments = await prismaEmployee.em_dept.findMany({
            select: {
                DEPTID: true,
                DEPTNAME: true,
            },
            orderBy: {
                DEPTNAME: "asc",
            },
        });
        return departments.map(toEmployeeDepartmentResponse);
    }
    static async create(requesterUserId, request) {
        await ensureCanManageEmployees(requesterUserId);
        const validated = Validation.validate(EmployeeValidation.CREATE, request);
        await ensureDepartmentExists(validated.DeptId);
        await ensureUniqueBadgeNumber(validated.BadgeNum.trim());
        const created = await prismaEmployee.em_employee.create({
            data: buildEmployeeCreateData(validated, requesterUserId),
            select: employeeSelect,
        });
        const response = await withDepartmentName(created);
        await writeAuditLog({
            module: "HRD",
            entity: "EMPLOYEE",
            entityId: String(response.UserId),
            action: "CREATE",
            actorId: requesterUserId,
            actorType: resolveActorType(requesterUserId),
            snapshot: getEmployeeSnapshot(response),
        });
        return response;
    }
    static async update(requesterUserId, request) {
        await ensureCanManageEmployees(requesterUserId);
        const validated = Validation.validate(EmployeeValidation.UPDATE, request);
        const existing = await prismaEmployee.em_employee.findUnique({
            where: { UserId: validated.userId },
            select: employeeSelect,
        });
        if (!existing) {
            throw new ResponseError(404, "Employee not found");
        }
        if (validated.DeptId !== undefined) {
            await ensureDepartmentExists(validated.DeptId);
        }
        if (validated.BadgeNum !== undefined) {
            await ensureUniqueBadgeNumber(validated.BadgeNum.trim(), validated.userId);
        }
        const updated = await prismaEmployee.em_employee.update({
            where: { UserId: validated.userId },
            data: buildEmployeeUpdateData(validated),
            select: employeeSelect,
        });
        const response = await withDepartmentName(updated);
        const before = await withDepartmentName(existing);
        const changes = buildChanges(before, response, EMPLOYEE_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "HRD",
                entity: "EMPLOYEE",
                entityId: String(response.UserId),
                action: "UPDATE",
                actorId: requesterUserId,
                actorType: resolveActorType(requesterUserId),
                changes,
            });
        }
        return response;
    }
    static async remove(requesterUserId, request) {
        await ensureCanManageEmployees(requesterUserId);
        const validated = Validation.validate(EmployeeValidation.DELETE, request);
        const existing = await prismaEmployee.em_employee.findUnique({
            where: { UserId: validated.userId },
            select: employeeSelect,
        });
        if (!existing) {
            throw new ResponseError(404, "Employee not found");
        }
        await ensureEmployeeCanBeDeleted(validated.userId);
        await prismaEmployee.em_employee.delete({
            where: { UserId: validated.userId },
        });
        const snapshot = await withDepartmentName(existing);
        await writeAuditLog({
            module: "HRD",
            entity: "EMPLOYEE",
            entityId: String(snapshot.UserId),
            action: "DELETE",
            actorId: requesterUserId,
            actorType: resolveActorType(requesterUserId),
            snapshot: getEmployeeSnapshot(snapshot),
        });
        return { message: "Employee deleted" };
    }
    static async updateJobDesc(requesterUserId, request) {
        await ensureCanManageEmployees(requesterUserId);
        const updateReq = Validation.validate(EmployeeValidation.UPDATE_JOB_DESC, request);
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: updateReq.userId },
            select: employeeSelect,
        });
        if (!employee) {
            throw new ResponseError(404, "Employee not found");
        }
        const updated = await prismaEmployee.em_employee.update({
            where: { UserId: updateReq.userId },
            data: {
                jobDesc: normalizeOptionalText(updateReq.jobDesc) ?? null,
                Lastupdate: new Date(),
            },
            select: employeeSelect,
        });
        const response = await withDepartmentName(updated);
        const before = await withDepartmentName(employee);
        const changes = buildChanges(before, response, ["jobDesc", "Lastupdate"]);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "HRD",
                entity: "EMPLOYEE",
                entityId: String(response.UserId),
                action: "UPDATE",
                actorId: requesterUserId,
                actorType: resolveActorType(requesterUserId),
                changes,
            });
        }
        return response;
    }
}
//# sourceMappingURL=employee-service.js.map