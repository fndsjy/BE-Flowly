import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { toEmployeeDepartmentResponse, toEmployeeResponse, } from "../model/employee-model.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { canCrud, canCrudModule, getAccessContext, getModuleAccessMap, } from "../utils/access-scope.js";
import { ensureHrdCrudAccess } from "../utils/hrd-access.js";
import { Validation } from "../validation/validation.js";
import { EmployeeValidation } from "../validation/employee-validation.js";
import { OnboardingService } from "./onboarding-service.js";
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
    status: true,
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
    "status",
    "statusLMS",
    "jobDesc",
    "state",
    "email",
    "ResignDate",
];
const CHART_MEMBER_RESIGN_AUDIT_FIELDS = [
    "memberChartId",
    "chartId",
    "userId",
    "jabatan",
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
const ensureEmployeeJobDescAccess = async (requesterUserId, employeeUserId) => {
    try {
        await ensureHrdCrudAccess(requesterUserId);
        return;
    }
    catch (err) {
        if (!(err instanceof ResponseError)) {
            throw err;
        }
    }
    const accessContext = await getAccessContext(requesterUserId);
    if (accessContext.isAdmin) {
        return;
    }
    const moduleAccessMap = await getModuleAccessMap(requesterUserId);
    if (!canCrudModule(moduleAccessMap, "CHART_MEMBER")) {
        throw new ResponseError(403, "Module CHART_MEMBER CRUD access required");
    }
    const chartMemberships = await prismaFlowly.chartMember.findMany({
        where: {
            userId: employeeUserId,
            isDeleted: false,
            node: {
                isDeleted: false,
            },
        },
        select: {
            node: {
                select: {
                    pilarId: true,
                    sbuId: true,
                    sbuSubId: true,
                },
            },
        },
    });
    const hasOrgCrud = chartMemberships.some(({ node }) => canCrud(accessContext.pilar, node.pilarId) ||
        canCrud(accessContext.sbu, node.sbuId) ||
        canCrud(accessContext.sbuSub, node.sbuSubId));
    if (!hasOrgCrud) {
        throw new ResponseError(403, "SBU SUB CRUD access required");
    }
};
const normalizeEmailText = (value) => {
    const normalized = normalizeOptionalText(value);
    return normalized ? normalized.toLowerCase() : normalized;
};
const normalizeIdentifierForCompare = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : null;
};
const normalizePhoneForCompare = (value) => {
    const digits = value?.replace(/\D+/g, "") ?? "";
    return digits.length > 0 ? digits : null;
};
const normalizeEmailForCompare = (value) => {
    const normalized = normalizeEmailText(value);
    return normalized && normalized !== "-" ? normalized : null;
};
const normalizeRequiredText = (value, fallback) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
};
const normalizeGenderInput = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    const normalized = trimmed.toLowerCase().replace(/[\s_-]/g, "");
    if (["l", "m", "male", "man", "lakilaki", "lelaki", "pria"].includes(normalized)) {
        return "male";
    }
    if (["p", "f", "female", "woman", "perempuan", "wanita"].includes(normalized)) {
        return "female";
    }
    return trimmed;
};
const normalizeStatusLmsInput = (value) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return false;
    }
    return normalized === "1" || normalized === "true" || normalized === "yes";
};
const toLegacyActorId = (value) => {
    const normalized = value.replace(/[^a-zA-Z0-9]/g, "").trim();
    return normalized ? normalized.slice(0, 5) : null;
};
const isResignedEmployeeRecord = (employee) => {
    const status = employee.status?.trim().toUpperCase();
    return Boolean(employee.ResignDate) || status === "I";
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
const clearResignedEmployeeChartMemberships = async (employeeUserId, requesterUserId) => {
    const memberships = await prismaFlowly.chartMember.findMany({
        where: {
            userId: employeeUserId,
            isDeleted: false,
        },
        select: {
            memberChartId: true,
            chartId: true,
            userId: true,
            jabatan: true,
        },
    });
    if (memberships.length === 0) {
        return 0;
    }
    const now = new Date();
    await prismaFlowly.chartMember.updateMany({
        where: {
            memberChartId: {
                in: memberships.map((membership) => membership.memberChartId),
            },
            userId: employeeUserId,
            isDeleted: false,
        },
        data: {
            userId: null,
            updatedAt: now,
            updatedBy: requesterUserId,
        },
    });
    await Promise.all(memberships.map((membership) => writeAuditLog({
        module: "CHART_MEMBER",
        entity: "CHART_MEMBER",
        entityId: membership.memberChartId,
        action: "UPDATE",
        actorId: requesterUserId,
        actorType: resolveActorType(requesterUserId),
        changes: buildChanges(membership, { ...membership, userId: null }, CHART_MEMBER_RESIGN_AUDIT_FIELDS),
        meta: {
            chartId: membership.chartId,
            reason: "EMPLOYEE_RESIGNED",
            employeeUserId,
        },
        at: now,
    })));
    return memberships.length;
};
const enforceResignedEmployeeSideEffects = async (employee, requesterUserId) => {
    if (!isResignedEmployeeRecord(employee)) {
        return;
    }
    await OnboardingService.failIncompleteEmployeeOnboardingForResignation({
        employeeUserId: employee.UserId,
        actorId: requesterUserId,
        resignDate: employee.ResignDate ?? null,
    });
    await clearResignedEmployeeChartMemberships(employee.UserId, requesterUserId);
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
const listEmployeeUniquenessCandidates = async (excludeUserId) => {
    const where = excludeUserId ? { UserId: { not: excludeUserId } } : undefined;
    return prismaEmployee.em_employee.findMany({
        ...(where ? { where } : {}),
        select: {
            UserId: true,
            BadgeNum: true,
            CardNo: true,
            Nik: true,
            Phone: true,
            email: true,
        },
    });
};
const hasMatchingIdentifier = (employee, normalizedValue) => normalizeIdentifierForCompare(employee.BadgeNum) === normalizedValue ||
    normalizeIdentifierForCompare(employee.CardNo) === normalizedValue;
const ensureEmployeeUniqueFields = async (params) => {
    const candidates = await listEmployeeUniquenessCandidates(params.excludeUserId);
    const normalizedBadgeNum = normalizeIdentifierForCompare(params.badgeNum);
    const normalizedCardNo = normalizeIdentifierForCompare(params.cardNo);
    const normalizedNik = normalizeIdentifierForCompare(params.nik);
    const normalizedPhone = normalizePhoneForCompare(params.phone);
    const normalizedEmail = normalizeEmailForCompare(params.email);
    if (normalizedBadgeNum &&
        candidates.some((employee) => hasMatchingIdentifier(employee, normalizedBadgeNum))) {
        throw new ResponseError(400, "Badge number sudah dipakai karyawan lain");
    }
    if (normalizedCardNo &&
        candidates.some((employee) => hasMatchingIdentifier(employee, normalizedCardNo))) {
        throw new ResponseError(400, "Card number sudah dipakai karyawan lain");
    }
    if (normalizedNik &&
        candidates.some((employee) => normalizeIdentifierForCompare(employee.Nik) === normalizedNik)) {
        throw new ResponseError(400, "NIK sudah dipakai karyawan lain");
    }
    if (normalizedPhone &&
        candidates.some((employee) => normalizePhoneForCompare(employee.Phone) === normalizedPhone)) {
        throw new ResponseError(400, "Nomor telepon sudah dipakai karyawan lain");
    }
    if (normalizedEmail &&
        candidates.some((employee) => normalizeEmailForCompare(employee.email) === normalizedEmail)) {
        throw new ResponseError(400, "Email sudah dipakai karyawan lain");
    }
};
const buildEmployeeCreateData = (request, requesterUserId) => {
    const now = new Date();
    const badgeNum = request.BadgeNum.trim();
    const cardNo = request.CardNo.trim();
    const resignDate = request.ResignDate ?? null;
    return {
        BadgeNum: badgeNum,
        Name: normalizeOptionalText(request.Name) ?? null,
        Gender: normalizeGenderInput(request.Gender) ?? null,
        BirthDay: request.BirthDay ?? null,
        HireDay: request.HireDay ?? null,
        Street: normalizeOptionalText(request.Street) ?? null,
        Religion: normalizeOptionalText(request.Religion) ?? null,
        Tipe: normalizeOptionalText(request.Tipe) ?? null,
        isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
        Phone: normalizeOptionalText(request.Phone) ?? null,
        DeptId: request.DeptId ?? null,
        Password: null,
        CardNo: cardNo,
        Shift: request.Shift ?? null,
        isMem: request.isMem ?? false,
        AddBy: toLegacyActorId(requesterUserId),
        Created_at: now,
        Lastupdate: now,
        isMemDate: request.isMem ? request.isMemDate ?? null : null,
        isFirstLogin: 1,
        ImgName: "domas.png",
        SbuSub: request.SbuSub ?? null,
        Nik: normalizeOptionalText(request.Nik) ?? null,
        ResignDate: resignDate,
        status: resignDate ? "I" : "A",
        statusLMS: normalizeStatusLmsInput(request.statusLMS),
        roleId: request.roleId ?? null,
        jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
        city: normalizeOptionalText(request.city) ?? null,
        state: normalizeRequiredText(request.state, "Indonesia"),
        email: normalizeEmailText(request.email) ?? null,
        IPMsnFinger: normalizeRequiredText(request.IPMsnFinger, "-"),
        BPJSKshtn: normalizeOptionalText(request.BPJSKshtn) ?? null,
        BPJSKtngkerjaan: normalizeOptionalText(request.BPJSKtngkerjaan) ?? null,
    };
};
const buildEmployeeUpdateData = (request) => {
    const badgeNum = request.BadgeNum.trim();
    const cardNo = request.CardNo.trim();
    const resignDate = request.ResignDate ?? null;
    const data = {
        Lastupdate: new Date(),
        BadgeNum: badgeNum,
        Name: normalizeOptionalText(request.Name) ?? null,
        Gender: normalizeGenderInput(request.Gender) ?? null,
        BirthDay: request.BirthDay ?? null,
        HireDay: request.HireDay ?? null,
        Street: normalizeOptionalText(request.Street) ?? null,
        Religion: normalizeOptionalText(request.Religion) ?? null,
        Tipe: normalizeOptionalText(request.Tipe) ?? null,
        isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
        Phone: normalizeOptionalText(request.Phone) ?? null,
        DeptId: request.DeptId ?? null,
        CardNo: cardNo,
        Shift: request.Shift ?? null,
        isMem: request.isMem ?? false,
        isMemDate: request.isMem ? request.isMemDate ?? null : null,
        SbuSub: request.SbuSub ?? null,
        Nik: normalizeOptionalText(request.Nik) ?? null,
        ResignDate: resignDate,
        status: resignDate ? "I" : "A",
        statusLMS: normalizeStatusLmsInput(request.statusLMS),
        roleId: request.roleId ?? null,
        jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
        city: normalizeOptionalText(request.city) ?? null,
        state: normalizeRequiredText(request.state, "Indonesia"),
        email: normalizeEmailText(request.email) ?? null,
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
        await ensureHrdCrudAccess(requesterUserId);
        const validated = Validation.validate(EmployeeValidation.CREATE, request);
        await ensureDepartmentExists(validated.DeptId);
        await ensureEmployeeUniqueFields({
            badgeNum: validated.BadgeNum,
            cardNo: validated.CardNo,
            nik: validated.Nik,
            phone: validated.Phone,
            email: validated.email,
        });
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
        await enforceResignedEmployeeSideEffects(created, requesterUserId);
        return response;
    }
    static async update(requesterUserId, request) {
        await ensureHrdCrudAccess(requesterUserId);
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
        await ensureEmployeeUniqueFields({
            badgeNum: validated.BadgeNum,
            cardNo: validated.CardNo,
            nik: validated.Nik,
            phone: validated.Phone,
            email: validated.email,
            excludeUserId: validated.userId,
        });
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
        await enforceResignedEmployeeSideEffects(updated, requesterUserId);
        return response;
    }
    static async remove(requesterUserId, request) {
        await ensureHrdCrudAccess(requesterUserId);
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
        const updateReq = Validation.validate(EmployeeValidation.UPDATE_JOB_DESC, request);
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: updateReq.userId },
            select: employeeSelect,
        });
        if (!employee) {
            throw new ResponseError(404, "Employee not found");
        }
        await ensureEmployeeJobDescAccess(requesterUserId, updateReq.userId);
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