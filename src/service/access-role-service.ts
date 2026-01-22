import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { AccessRoleValidation } from "../validation/access-role-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateAcessRoleId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";

import {
  type CreateAccessRoleRequest,
  type UpdateAccessRoleRequest,
  type DeleteAccessRoleRequest,
  type AccessRoleSummaryResponse,
  toAccessRoleResponse,
  toAccessRoleListResponse
} from "../model/access-role-model.js";

const normalizeUpper = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const normalizeRequiredUpper = (value: string) => value.trim().toUpperCase();

const allowedSubjectTypes = new Set(["ROLE", "USER"]);
const allowedAccessLevels = new Set(["READ", "CRUD"]);
const orgResourceTypes = new Set(["PILAR", "SBU", "SBU_SUB"]);

const normalizeAccessLevel = (value: string) => {
  const upper = normalizeRequiredUpper(value);
  if (upper === "FULL") {
    return "CRUD";
  }
  return upper;
};

const ensureSubjectExists = async (subjectType: string, subjectId: string) => {
  if (subjectType === "ROLE") {
    const role = await prismaFlowly.role.findUnique({
      where: { roleId: subjectId },
      select: { roleId: true, isDeleted: true, roleIsActive: true }
    });
    if (!role || role.isDeleted || !role.roleIsActive) {
      throw new ResponseError(400, "Role not found or inactive");
    }
    return;
  }

  if (subjectType === "USER") {
    const user = await prismaFlowly.user.findUnique({
      where: { userId: subjectId },
      select: { userId: true, isDeleted: true }
    });
    if (user && !user.isDeleted) {
      return;
    }

    const employeeId = Number(subjectId);
    if (!Number.isNaN(employeeId)) {
      const employee = await prismaEmployee.em_employee.findUnique({
        where: { UserId: employeeId },
        select: { UserId: true }
      });
      if (employee) {
        return;
      }
    }

    throw new ResponseError(400, "User not found or inactive");
  }

  throw new ResponseError(400, "Invalid subjectType");
};

const ensureMasterAccessRole = async (
  resourceType: string,
  masAccessId: string | null,
  resourceKey: string | null
) => {
  if (orgResourceTypes.has(resourceType)) {
    if (!resourceKey) {
      throw new ResponseError(400, "resourceKey is required for org resource");
    }
    return {
      masAccessId: null,
      resourceKey
    };
  }

  if (masAccessId) {
    const master = await prismaFlowly.masterAccessRole.findUnique({
      where: { masAccessId }
    });
    if (!master || master.isDeleted) {
      throw new ResponseError(400, "Master access role not found");
    }
    if (master.resourceType !== resourceType) {
      throw new ResponseError(400, "Resource type does not match master access role");
    }
    if (resourceKey && master.resourceKey !== resourceKey) {
      throw new ResponseError(400, "Resource key does not match master access role");
    }
    return {
      masAccessId,
      resourceKey: resourceKey ?? master.resourceKey
    };
  }

  if (resourceKey) {
    const master = await prismaFlowly.masterAccessRole.findUnique({
      where: {
        resourceType_resourceKey: {
          resourceType,
          resourceKey
        }
      }
    });
    if (!master || master.isDeleted) {
      throw new ResponseError(400, "Master access role not found");
    }
    return {
      masAccessId: master.masAccessId,
      resourceKey
    };
  }

  throw new ResponseError(400, "masAccessId or resourceKey is required");
};

const parseOrgResourceId = (resourceType: string, resourceKey: string) => {
  const resourceId = Number(resourceKey);
  if (Number.isNaN(resourceId)) {
    throw new ResponseError(400, `${resourceType} resourceKey must be numeric`);
  }
  return resourceId;
};

const ensureOrgResourceExists = async (resourceType: string, resourceKey: string) => {
  if (!orgResourceTypes.has(resourceType)) {
    return;
  }

  const resourceId = parseOrgResourceId(resourceType, resourceKey);
  if (resourceType === "PILAR") {
    const pilar = await prismaEmployee.em_pilar.findFirst({
      where: { id: resourceId, OR: [{ isDeleted: false }, { isDeleted: null }] },
      select: { id: true }
    });
    if (!pilar) throw new ResponseError(400, "Pilar not found");
    return;
  }

  if (resourceType === "SBU") {
    const sbu = await prismaEmployee.em_sbu.findFirst({
      where: { id: resourceId, OR: [{ isDeleted: false }, { isDeleted: null }] },
      select: { id: true }
    });
    if (!sbu) throw new ResponseError(400, "SBU not found");
    return;
  }

  if (resourceType === "SBU_SUB") {
    const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
      where: { id: resourceId, OR: [{ isDeleted: false }, { isDeleted: null }] },
      select: { id: true }
    });
    if (!sbuSub) throw new ResponseError(400, "SBU SUB not found");
  }
};

const resolveEmployeeIdForFocus = async (
  requesterId: string,
  requester: { badgeNumber?: string | null } | null
): Promise<number | null> => {
  const numericId = Number(requesterId);
  if (!Number.isNaN(numericId)) {
    const employee = await prismaEmployee.em_employee.findUnique({
      where: { UserId: numericId },
      select: { UserId: true }
    });
    if (employee) {
      return employee.UserId;
    }
  }

  const badgeNumber = requester?.badgeNumber?.trim();
  if (!badgeNumber) {
    return null;
  }

  const employee = await prismaEmployee.em_employee.findFirst({
    where: { BadgeNum: badgeNumber },
    select: { UserId: true }
  });
  return employee?.UserId ?? null;
};

const resolveFocusPilarIds = async (
  requesterId: string,
  requester: { badgeNumber?: string | null } | null
): Promise<number[]> => {
  const employeeId = await resolveEmployeeIdForFocus(requesterId, requester);
  if (!employeeId) {
    return [];
  }

  const focus = new Set<number>();

  const [chartMembers, pilarPics, sbuPics, sbuSubPics] = await Promise.all([
    prismaFlowly.chartMember.findMany({
      where: {
        userId: employeeId,
        isDeleted: false,
        node: { isDeleted: false }
      },
      select: { node: { select: { pilarId: true } } }
    }),
    prismaEmployee.em_pilar.findMany({
      where: {
        pic: employeeId,
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }]
      },
      select: { id: true }
    }),
    prismaEmployee.em_sbu.findMany({
      where: {
        pic: employeeId,
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }]
      },
      select: { sbu_pilar: true }
    }),
    prismaEmployee.em_sbu_sub.findMany({
      where: {
        pic: employeeId,
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }]
      },
      select: { sbu_pilar: true }
    })
  ]);

  for (const member of chartMembers) {
    if (member.node?.pilarId) {
      focus.add(member.node.pilarId);
    }
  }

  for (const pilar of pilarPics) {
    focus.add(pilar.id);
  }

  for (const sbu of sbuPics) {
    if (sbu.sbu_pilar !== null && sbu.sbu_pilar !== undefined) {
      focus.add(sbu.sbu_pilar);
    }
  }

  for (const sbuSub of sbuSubPics) {
    if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
      focus.add(sbuSub.sbu_pilar);
    }
  }

  return Array.from(focus);
};

export class AccessRoleService {
  static async create(requesterId: string, reqBody: CreateAccessRoleRequest) {
    const req = Validation.validate(AccessRoleValidation.CREATE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can create access role");
    }

    const subjectType = normalizeRequiredUpper(req.subjectType);
    const subjectId = req.subjectId.trim();
    const resourceType = normalizeRequiredUpper(req.resourceType);
    const accessLevel = normalizeRequiredUpper(req.accessLevel);
    const isActive = req.isActive ?? true;
    const masAccessId = normalizeUpper(req.masAccessId) ?? null;
    const resourceKey = normalizeUpper(req.resourceKey) ?? null;

    if (!allowedSubjectTypes.has(subjectType)) {
      throw new ResponseError(400, "Invalid subjectType");
    }
    if (!allowedAccessLevels.has(accessLevel)) {
      throw new ResponseError(400, "Invalid access level");
    }

    await ensureSubjectExists(subjectType, subjectId);

    const masterInfo = await ensureMasterAccessRole(resourceType, masAccessId, resourceKey);
    if (masterInfo.resourceKey) {
      await ensureOrgResourceExists(resourceType, masterInfo.resourceKey);
    }

    const existing = await prismaFlowly.accessRole.findFirst({
      where: {
        subjectType,
        subjectId,
        resourceType,
        masAccessId: masterInfo.masAccessId ?? null,
        resourceKey: masterInfo.resourceKey ?? null
      },
      select: { accessId: true }
    });

    if (existing) {
      throw new ResponseError(400, "Access role already exists");
    }

    const accessId = await generateAcessRoleId();
    const now = new Date();
    const created = await prismaFlowly.accessRole.create({
      data: {
        accessId,
        subjectType,
        subjectId,
        resourceType,
        masAccessId: masterInfo.masAccessId ?? null,
        resourceKey: masterInfo.resourceKey ?? null,
        accessLevel,
        isActive,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId
      }
    });

    return toAccessRoleResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateAccessRoleRequest) {
    const req = Validation.validate(AccessRoleValidation.UPDATE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can update access role");
    }

    const existing = await prismaFlowly.accessRole.findUnique({
      where: { accessId: req.accessId }
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Access role not found");
    }

    const finalSubjectType = normalizeRequiredUpper(req.subjectType ?? existing.subjectType);
    const finalSubjectId = req.subjectId ? req.subjectId.trim() : existing.subjectId;
    const finalResourceType = normalizeRequiredUpper(req.resourceType ?? existing.resourceType);
    const finalAccessLevel = req.accessLevel
      ? normalizeRequiredUpper(req.accessLevel)
      : existing.accessLevel;

    const finalMasAccessId = req.masAccessId === undefined
      ? existing.masAccessId
      : (normalizeUpper(req.masAccessId) ?? null);
    const finalResourceKey = req.resourceKey === undefined
      ? existing.resourceKey
      : (normalizeUpper(req.resourceKey) ?? null);

    if (!allowedSubjectTypes.has(finalSubjectType)) {
      throw new ResponseError(400, "Invalid subjectType");
    }
    if (!allowedAccessLevels.has(finalAccessLevel)) {
      throw new ResponseError(400, "Invalid access level");
    }

    await ensureSubjectExists(finalSubjectType, finalSubjectId);

    const masterInfo = await ensureMasterAccessRole(
      finalResourceType,
      finalMasAccessId ?? null,
      finalResourceKey ?? null
    );
    if (masterInfo.resourceKey) {
      await ensureOrgResourceExists(finalResourceType, masterInfo.resourceKey);
    }

    const conflict = await prismaFlowly.accessRole.findFirst({
      where: {
        subjectType: finalSubjectType,
        subjectId: finalSubjectId,
        resourceType: finalResourceType,
        masAccessId: masterInfo.masAccessId ?? null,
        resourceKey: masterInfo.resourceKey ?? null,
        accessId: { not: req.accessId }
      },
      select: { accessId: true }
    });

    if (conflict) {
      throw new ResponseError(400, "Access role already exists");
    }

    const updated = await prismaFlowly.accessRole.update({
      where: { accessId: req.accessId },
      data: {
        subjectType: finalSubjectType,
        subjectId: finalSubjectId,
        resourceType: finalResourceType,
        masAccessId: masterInfo.masAccessId ?? null,
        resourceKey: masterInfo.resourceKey ?? null,
        accessLevel: finalAccessLevel,
        isActive: req.isActive ?? existing.isActive,
        updatedAt: new Date(),
        updatedBy: requesterId
      }
    });

    return toAccessRoleResponse(updated);
  }

  static async softDelete(requesterId: string, reqBody: DeleteAccessRoleRequest) {
    const req = Validation.validate(AccessRoleValidation.DELETE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can delete access role");
    }

    const existing = await prismaFlowly.accessRole.findUnique({
      where: { accessId: req.accessId }
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Access role not found");
    }

    const now = new Date();
    await prismaFlowly.accessRole.update({
      where: { accessId: req.accessId },
      data: {
        isActive: false,
        updatedAt: now,
        updatedBy: requesterId
      }
    });

    return { message: "Access role deactivated" };
  }

  static async list(requesterId: string, filters: {
    subjectType?: string;
    subjectId?: string;
    resourceType?: string;
    resourceKey?: string;
    masAccessId?: string;
    isActive?: boolean;
  }) {
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can access access roles");
    }

    const subjectType = filters.subjectType
      ? normalizeRequiredUpper(filters.subjectType)
      : undefined;
    const resourceType = filters.resourceType
      ? normalizeRequiredUpper(filters.resourceType)
      : undefined;
    const resourceKey = filters.resourceKey
      ? normalizeRequiredUpper(filters.resourceKey)
      : undefined;
    const masAccessId = filters.masAccessId ? filters.masAccessId.trim() : undefined;

    if (subjectType && !allowedSubjectTypes.has(subjectType)) {
      throw new ResponseError(400, "Invalid subjectType");
    }

    const list = await prismaFlowly.accessRole.findMany({
      where: {
        isDeleted: false,
        ...(subjectType ? { subjectType } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId.trim() } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(resourceKey ? { resourceKey } : {}),
        ...(masAccessId ? { masAccessId } : {}),
        ...(filters.isActive === undefined ? {} : { isActive: filters.isActive })
      },
      orderBy: [
        { subjectType: "asc" },
        { subjectId: "asc" },
        { resourceType: "asc" }
      ]
    });

    return list.map(toAccessRoleListResponse);
  }

  static async getSummary(requesterId: string): Promise<AccessRoleSummaryResponse> {
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    let isAdmin = false;
    let requesterRoleId: string | null = null;
    let isEmployeeUser = false;
    let shouldCheckEmployee = false;

    if (requester) {
      isAdmin = requester.role.roleLevel === 1;
      requesterRoleId = requester.roleId;
      shouldCheckEmployee = !isAdmin;
    } else {
      const employeeId = Number(requesterId);
      if (Number.isNaN(employeeId)) {
        throw new ResponseError(401, "Unauthorized");
      }

      const employee = await prismaEmployee.em_employee.findUnique({
        where: { UserId: employeeId },
        select: { UserId: true }
      });

      if (!employee) {
        throw new ResponseError(401, "Unauthorized");
      }
      isEmployeeUser = true;
    }

    if (shouldCheckEmployee) {
      const employeeId = Number(requesterId);
      if (!Number.isNaN(employeeId)) {
        const employee = await prismaEmployee.em_employee.findUnique({
          where: { UserId: employeeId },
          select: { UserId: true }
        });
        if (employee) {
          isEmployeeUser = true;
        }
      }
    }

    const accessContext = await getAccessContext(requesterId);

    const orgScope = isAdmin
      ? {
          pilarRead: true,
          pilarCrud: true,
          sbuRead: true,
          sbuCrud: true,
          sbuSubRead: true,
          sbuSubCrud: true
        }
      : {
          pilarRead: accessContext.pilar.read.size > 0 || accessContext.pilar.crud.size > 0,
          pilarCrud: accessContext.pilar.crud.size > 0,
          sbuRead: accessContext.sbu.read.size > 0 || accessContext.sbu.crud.size > 0,
          sbuCrud: accessContext.sbu.crud.size > 0,
          sbuSubRead: accessContext.sbuSub.read.size > 0 || accessContext.sbuSub.crud.size > 0,
          sbuSubCrud: accessContext.sbuSub.crud.size > 0
        };

    const orgAccess = isAdmin
      ? {
          pilarRead: [],
          pilarCrud: [],
          sbuRead: [],
          sbuCrud: [],
          sbuSubRead: [],
          sbuSubCrud: []
        }
      : {
          pilarRead: Array.from(accessContext.pilar.read),
          pilarCrud: Array.from(accessContext.pilar.crud),
          sbuRead: Array.from(accessContext.sbu.read),
          sbuCrud: Array.from(accessContext.sbu.crud),
          sbuSubRead: Array.from(accessContext.sbuSub.read),
          sbuSubCrud: Array.from(accessContext.sbuSub.crud)
        };
    const focusPilarIds = await resolveFocusPilarIds(requesterId, requester);

    if (!isAdmin && isEmployeeUser) {
      const menuAccess: AccessRoleSummaryResponse["menuAccess"] = [];
      const moduleAccess: AccessRoleSummaryResponse["moduleAccess"] = [];

      const applyEmployeeRead = (resourceType: string, resourceKey: string) => {
        moduleAccess.push({ resourceType, resourceKey, accessLevel: "READ" });
      };

      const applyEmployeeMenuRead = (resourceKey: string) => {
        menuAccess.push({ resourceType: "MENU", resourceKey, accessLevel: "READ" });
      };

      if (orgScope.pilarRead || orgScope.pilarCrud || orgScope.sbuRead || orgScope.sbuCrud || orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeMenuRead("ORGANISASI");
      }
      if (orgScope.pilarRead || orgScope.pilarCrud) {
        applyEmployeeRead("MODULE", "PILAR");
      }
      if (orgScope.sbuRead || orgScope.sbuCrud) {
        applyEmployeeRead("MODULE", "SBU");
      }
      if (orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeRead("MODULE", "SBU_SUB");
      }
      if (orgScope.pilarRead || orgScope.pilarCrud || orgScope.sbuRead || orgScope.sbuCrud || orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeRead("MODULE", "CHART");
        applyEmployeeRead("MODULE", "CHART_MEMBER");
      }

      return {
        isAdmin,
        menuAccess,
        moduleAccess,
        focusPilarIds,
        orgScope,
        orgAccess
      };
    }

    const subjectFilters = [
      { subjectType: "USER", subjectId: requesterId }
    ];

    if (requesterRoleId) {
      subjectFilters.unshift({ subjectType: "ROLE", subjectId: requesterRoleId });
    }

    const accessRoles = await prismaFlowly.accessRole.findMany({
      where: {
        isDeleted: false,
        resourceType: { in: ["MENU", "MODULE"] },
        OR: subjectFilters
      },
      select: {
        subjectType: true,
        subjectId: true,
        resourceType: true,
        resourceKey: true,
        masAccessId: true,
        accessLevel: true,
        isActive: true
      }
    });

    const missingResourceKeyIds = accessRoles
      .filter((role) => !role.resourceKey && role.masAccessId)
      .map((role) => role.masAccessId as string);

    const masterAccessRoles = missingResourceKeyIds.length > 0
      ? await prismaFlowly.masterAccessRole.findMany({
          where: { masAccessId: { in: missingResourceKeyIds } },
          select: { masAccessId: true, resourceKey: true, resourceType: true }
        })
      : [];

    const masterAccessMap = new Map(
      masterAccessRoles.map((role) => [role.masAccessId, role])
    );

    const accessMap = new Map<string, { resourceType: string; resourceKey: string; accessLevel: string }>();
    const deniedAccessKeys = new Set<string>();

    const applyAccess = (
      resourceType: string,
      resourceKey: string,
      accessLevel: string,
      override: boolean
    ) => {
      const normalizedLevel = normalizeAccessLevel(accessLevel);
      if (!allowedAccessLevels.has(normalizedLevel)) {
        return;
      }

      const key = `${resourceType}:${resourceKey}`;
      const entry = { resourceType, resourceKey, accessLevel: normalizedLevel };
      const existing = accessMap.get(key);

      if (!existing || override) {
        accessMap.set(key, entry);
        return;
      }

      if (existing.accessLevel === "READ" && normalizedLevel === "CRUD") {
        accessMap.set(key, entry);
      }
    };

    const roleAccess = accessRoles.filter(
      (access) => normalizeRequiredUpper(access.subjectType) === "ROLE"
    );
    const userAccess = accessRoles.filter(
      (access) => normalizeRequiredUpper(access.subjectType) === "USER"
    );

    const resolveResourceKey = (access: typeof accessRoles[number]) => {
      const resourceType = normalizeRequiredUpper(access.resourceType);
      const master = !access.resourceKey && access.masAccessId
        ? masterAccessMap.get(access.masAccessId)
        : undefined;
      const resourceKey = access.resourceKey ?? master?.resourceKey ?? null;
      if (!resourceKey) {
        return null;
      }
      return {
        resourceType,
        resourceKey: normalizeRequiredUpper(resourceKey)
      };
    };

    for (const access of roleAccess) {
      if (!access.isActive) {
        continue;
      }

      const resolved = resolveResourceKey(access);
      if (!resolved) {
        continue;
      }

      applyAccess(resolved.resourceType, resolved.resourceKey, access.accessLevel, false);
    }

    for (const access of userAccess) {
      const resolved = resolveResourceKey(access);
      if (!resolved) {
        continue;
      }

      const key = `${resolved.resourceType}:${resolved.resourceKey}`;
      if (!access.isActive) {
        accessMap.delete(key);
        deniedAccessKeys.add(key);
        continue;
      }

      applyAccess(resolved.resourceType, resolved.resourceKey, access.accessLevel, true);
    }

    if (!isAdmin && isEmployeeUser) {
      const applyEmployeeRead = (resourceType: string, resourceKey: string) => {
        const key = `${resourceType}:${resourceKey}`;
        if (deniedAccessKeys.has(key)) {
          return;
        }
        applyAccess(resourceType, resourceKey, "READ", false);
      };

      if (orgScope.pilarRead || orgScope.pilarCrud || orgScope.sbuRead || orgScope.sbuCrud || orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeRead("MENU", "ORGANISASI");
      }
      if (orgScope.pilarRead || orgScope.pilarCrud) {
        applyEmployeeRead("MODULE", "PILAR");
      }
      if (orgScope.sbuRead || orgScope.sbuCrud) {
        applyEmployeeRead("MODULE", "SBU");
      }
      if (orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeRead("MODULE", "SBU_SUB");
      }
      if (orgScope.pilarRead || orgScope.pilarCrud || orgScope.sbuRead || orgScope.sbuCrud || orgScope.sbuSubRead || orgScope.sbuSubCrud) {
        applyEmployeeRead("MODULE", "CHART");
        applyEmployeeRead("MODULE", "CHART_MEMBER");
      }
    }

    const menuAccess = [];
    const moduleAccess = [];

    for (const entry of accessMap.values()) {
      if (entry.resourceType === "MENU") {
        menuAccess.push(entry);
      } else if (entry.resourceType === "MODULE") {
        moduleAccess.push(entry);
      }
    }

    return {
      isAdmin,
      menuAccess,
      moduleAccess,
      focusPilarIds,
      orgScope,
      orgAccess
    };
  }
}
