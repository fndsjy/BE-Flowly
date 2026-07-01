import { prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
const normalizeAccessLevel = (value) => {
    const upper = value.trim().toUpperCase();
    return upper === "FULL" ? "CRUD" : upper;
};
export const resolveAttendanceAccessLevel = async (requesterUserId) => {
    const requester = await prismaFlowly.user.findUnique({
        where: { userId: requesterUserId },
        include: { role: true },
    });
    if (!requester) {
        throw new ResponseError(401, "Unauthorized");
    }
    if (requester.role.roleLevel === 1) {
        return "CRUD";
    }
    const masterMenu = await prismaFlowly.masterAccessRole.findUnique({
        where: {
            resourceType_resourceKey: {
                resourceType: "MENU",
                resourceKey: "ABSENSI",
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
                            OR: [{ resourceKey: "ABSENSI" }, { masAccessId: masterMenu.masAccessId }],
                        },
                    ],
                }
                : { resourceKey: "ABSENSI" }),
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
    if (!finalLevel) {
        throw new ResponseError(403, "Menu ABSENSI access required");
    }
    return finalLevel;
};
export const ensureAttendanceReadAccess = async (requesterUserId) => {
    await resolveAttendanceAccessLevel(requesterUserId);
};
export const ensureAttendanceCrudAccess = async (requesterUserId) => {
    const level = await resolveAttendanceAccessLevel(requesterUserId);
    if (level !== "CRUD") {
        throw new ResponseError(403, "Menu ABSENSI CRUD access required");
    }
};
//# sourceMappingURL=attendance-access.js.map