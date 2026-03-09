import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { canCrudModule, canReadModule, getModuleAccessMap } from "./access-scope.js";
const resolveEmployeeId = async (userId, flowlyUser) => {
    const numericId = Number(userId);
    if (!Number.isNaN(numericId)) {
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: numericId },
            select: { UserId: true },
        });
        if (employee) {
            return employee.UserId;
        }
    }
    const badgeNumber = flowlyUser?.badgeNumber?.trim();
    if (!badgeNumber) {
        return null;
    }
    const employee = await prismaEmployee.em_employee.findFirst({
        where: { BadgeNum: badgeNumber },
        select: { UserId: true },
    });
    return employee?.UserId ?? null;
};
export const resolveCaseAccess = async (requesterId) => {
    const flowlyUser = await prismaFlowly.user.findUnique({
        where: { userId: requesterId, isDeleted: false },
        include: { role: true },
    });
    if (flowlyUser) {
        const isAdmin = flowlyUser.role?.roleLevel === 1;
        if (isAdmin) {
            return {
                actorType: "FLOWLY",
                requesterId,
                canRead: true,
                canCrud: true,
            };
        }
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        const canCrud = canCrudModule(moduleAccessMap, "CASE");
        const canRead = canReadModule(moduleAccessMap, "CASE") || canCrud;
        if (!canRead) {
            const employeeId = await resolveEmployeeId(requesterId, flowlyUser);
            if (employeeId !== null) {
                return {
                    actorType: "EMPLOYEE",
                    requesterId,
                    employeeId,
                    canRead: true,
                    canCrud: false,
                };
            }
        }
        return {
            actorType: "FLOWLY",
            requesterId,
            canRead,
            canCrud,
        };
    }
    const employeeId = await resolveEmployeeId(requesterId, null);
    if (employeeId === null) {
        throw new ResponseError(401, "Unauthorized");
    }
    return {
        actorType: "EMPLOYEE",
        requesterId,
        employeeId,
        canRead: true,
        canCrud: false,
    };
};
export const assertCaseRead = (access) => {
    if (access.actorType === "FLOWLY" && !access.canRead) {
        throw new ResponseError(403, "Module CASE access required");
    }
};
export const assertCaseCrud = (access) => {
    if (access.actorType === "FLOWLY" && !access.canCrud) {
        throw new ResponseError(403, "Module CASE CRUD access required");
    }
};
export const isPicForSbuSub = async (employeeId, sbuSubId) => {
    const pic = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
            id: sbuSubId,
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    return Boolean(pic);
};
export const isAssigneeForDepartment = async (employeeId, caseDepartmentId) => {
    const assignee = await prismaFlowly.caseDepartmentAssignee.findFirst({
        where: {
            caseDepartmentId,
            employeeId,
            isDeleted: false,
            isActive: true,
        },
        select: { caseDepartmentAssigneeId: true },
    });
    if (assignee)
        return true;
    const legacy = await prismaFlowly.caseDepartment.findFirst({
        where: {
            caseDepartmentId,
            assigneeEmployeeId: employeeId,
            isDeleted: false,
        },
        select: { caseDepartmentId: true },
    });
    return Boolean(legacy);
};
export const isAssigneeForCase = async (employeeId, caseId) => {
    const assignee = await prismaFlowly.caseDepartmentAssignee.findFirst({
        where: {
            employeeId,
            isDeleted: false,
            isActive: true,
            department: {
                caseId,
                isDeleted: false,
            },
        },
        select: { caseDepartmentAssigneeId: true },
    });
    if (assignee)
        return true;
    const legacy = await prismaFlowly.caseDepartment.findFirst({
        where: {
            caseId,
            assigneeEmployeeId: employeeId,
            isDeleted: false,
        },
        select: { caseDepartmentId: true },
    });
    return Boolean(legacy);
};
export const isAssigneeForSbuSub = async (employeeId, caseId, sbuSubId) => {
    const assignee = await prismaFlowly.caseDepartmentAssignee.findFirst({
        where: {
            employeeId,
            isDeleted: false,
            isActive: true,
            department: {
                caseId,
                sbuSubId,
                isDeleted: false,
            },
        },
        select: { caseDepartmentAssigneeId: true },
    });
    if (assignee)
        return true;
    const legacy = await prismaFlowly.caseDepartment.findFirst({
        where: {
            caseId,
            sbuSubId,
            assigneeEmployeeId: employeeId,
            isDeleted: false,
        },
        select: { caseDepartmentId: true },
    });
    return Boolean(legacy);
};
export const getEmployeeChartSbuSubIds = async (employeeId) => {
    const members = await prismaFlowly.chartMember.findMany({
        where: {
            userId: employeeId,
            isDeleted: false,
            node: { isDeleted: false },
        },
        select: {
            node: { select: { sbuSubId: true } },
        },
    });
    const ids = members
        .map((member) => member.node?.sbuSubId)
        .filter((id) => Number.isFinite(id));
    return Array.from(new Set(ids));
};
export const isRequesterForCase = async (employeeId, caseId) => {
    const caseHeader = await prismaFlowly.caseHeader.findUnique({
        where: { caseId },
        select: { requesterEmployeeId: true, isDeleted: true },
    });
    if (!caseHeader || caseHeader.isDeleted)
        return false;
    return caseHeader.requesterEmployeeId === employeeId;
};
export const isEmployeeInvolvedInCase = async (employeeId, caseId) => {
    if (await isRequesterForCase(employeeId, caseId))
        return true;
    if (await isAssigneeForCase(employeeId, caseId))
        return true;
    const departments = await prismaFlowly.caseDepartment.findMany({
        where: { caseId, isDeleted: false },
        select: { sbuSubId: true },
    });
    if (departments.length === 0)
        return false;
    const sbuSubIds = Array.from(new Set(departments.map((dept) => dept.sbuSubId)));
    const pic = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
            id: { in: sbuSubIds },
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    return Boolean(pic);
};
export const canEmployeeViewCase = async (employeeId, caseId) => {
    const caseHeader = await prismaFlowly.caseHeader.findUnique({
        where: { caseId },
        select: {
            caseId: true,
            requesterEmployeeId: true,
            visibility: true,
            originSbuSubId: true,
            isDeleted: true,
        },
    });
    if (!caseHeader || caseHeader.isDeleted)
        return false;
    if (caseHeader.requesterEmployeeId === employeeId)
        return true;
    if (await isAssigneeForCase(employeeId, caseId))
        return true;
    const picSubs = await prismaEmployee.em_sbu_sub.findMany({
        where: {
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    const picSbuSubIds = picSubs.map((sub) => sub.id);
    if (picSbuSubIds.length > 0 &&
        caseHeader.originSbuSubId &&
        picSbuSubIds.includes(caseHeader.originSbuSubId)) {
        return true;
    }
    if (picSbuSubIds.length > 0) {
        const picDept = await prismaFlowly.caseDepartment.findFirst({
            where: {
                caseId,
                isDeleted: false,
                sbuSubId: { in: picSbuSubIds },
            },
            select: { caseDepartmentId: true },
        });
        if (picDept)
            return true;
    }
    if (caseHeader.visibility === "PUBLIC") {
        const chartSbuSubIds = await getEmployeeChartSbuSubIds(employeeId);
        if (chartSbuSubIds.length > 0) {
            if (caseHeader.originSbuSubId &&
                chartSbuSubIds.includes(caseHeader.originSbuSubId)) {
                return true;
            }
            const chartDept = await prismaFlowly.caseDepartment.findFirst({
                where: {
                    caseId,
                    isDeleted: false,
                    sbuSubId: { in: chartSbuSubIds },
                },
                select: { caseDepartmentId: true },
            });
            if (chartDept)
                return true;
        }
    }
    return false;
};
export const canEmployeeViewFishbone = async (employeeId, caseFishboneId) => {
    const fishbone = await prismaFlowly.caseFishboneMaster.findUnique({
        where: { caseFishboneId },
        select: { caseId: true, sbuSubId: true, isDeleted: true },
    });
    if (!fishbone || fishbone.isDeleted)
        return false;
    const isPic = await isPicForSbuSub(employeeId, fishbone.sbuSubId);
    const isAssignee = await isAssigneeForSbuSub(employeeId, fishbone.caseId, fishbone.sbuSubId);
    if (isPic || isAssignee)
        return true;
    return isEmployeeInvolvedInCase(employeeId, fishbone.caseId);
};
export const ensureCaseNotClosed = async (caseId) => {
    const caseHeader = await prismaFlowly.caseHeader.findUnique({
        where: { caseId },
        select: {
            caseId: true,
            isDeleted: true,
            feedbackApprovedAt: true,
        },
    });
    if (!caseHeader || caseHeader.isDeleted) {
        throw new ResponseError(404, "Case not found");
    }
    if (caseHeader.feedbackApprovedAt) {
        throw new ResponseError(400, "Case already closed");
    }
    return caseHeader;
};
//# sourceMappingURL=case-access.js.map