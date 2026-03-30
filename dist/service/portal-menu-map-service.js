import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { PortalMenuMapValidation } from "../validation/portal-menu-map-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generatePortalMenuMapId } from "../utils/id-generator.js";
import { toPortalMenuMapListResponse, toPortalMenuMapResponse, } from "../model/portal-menu-map-model.js";
const normalizeUpper = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.toUpperCase() : null;
};
const normalizeId = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};
const masterAccessRoleSelect = {
    masAccessId: true,
    resourceType: true,
    resourceKey: true,
    displayName: true,
    route: true,
    orderIndex: true,
    isActive: true,
    isDeleted: true,
};
const portalMenuMapInclude = {
    portal: { select: masterAccessRoleSelect },
    menu: { select: masterAccessRoleSelect },
};
const ensureAdmin = async (requesterId) => {
    const requester = await prismaFlowly.user.findUnique({
        where: { userId: requesterId },
        include: { role: true },
    });
    if (!requester || requester.role.roleLevel !== 1) {
        throw new ResponseError(403, "Only admin can manage portal menu mappings");
    }
};
const resolveMasterAccessRole = async ({ expectedType, masAccessId, resourceKey, }) => {
    const normalizedId = normalizeId(masAccessId) ?? null;
    const normalizedKey = normalizeUpper(resourceKey) ?? null;
    if (!normalizedId && !normalizedKey) {
        throw new ResponseError(400, `${expectedType.toLowerCase()}MasAccessId or ${expectedType.toLowerCase()}Key is required`);
    }
    const record = normalizedId
        ? await prismaFlowly.masterAccessRole.findUnique({
            where: { masAccessId: normalizedId },
            select: masterAccessRoleSelect,
        })
        : await prismaFlowly.masterAccessRole.findUnique({
            where: {
                resourceType_resourceKey: {
                    resourceType: expectedType,
                    resourceKey: normalizedKey,
                },
            },
            select: masterAccessRoleSelect,
        });
    if (!record || record.isDeleted) {
        throw new ResponseError(400, `${expectedType === "PORTAL" ? "Portal" : "Menu"} resource not found`);
    }
    const normalizedType = record.resourceType.trim().toUpperCase();
    if (normalizedType !== expectedType) {
        throw new ResponseError(400, `${record.resourceKey} is not a ${expectedType.toLowerCase()} resource`);
    }
    if (normalizedKey && record.resourceKey !== normalizedKey) {
        throw new ResponseError(400, `${expectedType === "PORTAL" ? "Portal" : "Menu"} key does not match the selected resource`);
    }
    return record;
};
const getNextOrderIndex = async (portalMasAccessId) => {
    const last = await prismaFlowly.portalMenuMap.findFirst({
        where: {
            portalMasAccessId,
            isDeleted: false,
        },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
    });
    return (last?.orderIndex ?? 0) + 10;
};
export class PortalMenuMapService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(PortalMenuMapValidation.CREATE, reqBody);
        await ensureAdmin(requesterId);
        const portal = await resolveMasterAccessRole({
            expectedType: "PORTAL",
            masAccessId: request.portalMasAccessId,
            resourceKey: request.portalKey,
        });
        const menu = await resolveMasterAccessRole({
            expectedType: "MENU",
            masAccessId: request.menuMasAccessId,
            resourceKey: request.menuKey,
        });
        const existing = await prismaFlowly.portalMenuMap.findUnique({
            where: {
                portalMasAccessId_menuMasAccessId: {
                    portalMasAccessId: portal.masAccessId,
                    menuMasAccessId: menu.masAccessId,
                },
            },
            include: portalMenuMapInclude,
        });
        const now = new Date();
        if (existing) {
            if (!existing.isDeleted) {
                throw new ResponseError(400, "Portal menu mapping already exists");
            }
            const restored = await prismaFlowly.portalMenuMap.update({
                where: { portalMenuMapId: existing.portalMenuMapId },
                data: {
                    orderIndex: request.orderIndex ??
                        (existing.orderIndex > 0 ? existing.orderIndex : menu.orderIndex),
                    isActive: request.isActive ?? existing.isActive,
                    isDeleted: false,
                    deletedAt: null,
                    deletedBy: null,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
                include: portalMenuMapInclude,
            });
            return toPortalMenuMapResponse(restored);
        }
        const createId = await generatePortalMenuMapId();
        const orderIndex = request.orderIndex ?? (menu.orderIndex > 0 ? menu.orderIndex : await getNextOrderIndex(portal.masAccessId));
        const created = await prismaFlowly.portalMenuMap.create({
            data: {
                portalMenuMapId: createId(),
                portalMasAccessId: portal.masAccessId,
                menuMasAccessId: menu.masAccessId,
                orderIndex,
                isActive: request.isActive ?? true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
            },
            include: portalMenuMapInclude,
        });
        return toPortalMenuMapResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(PortalMenuMapValidation.UPDATE, reqBody);
        await ensureAdmin(requesterId);
        const existing = await prismaFlowly.portalMenuMap.findUnique({
            where: { portalMenuMapId: request.portalMenuMapId },
            include: portalMenuMapInclude,
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Portal menu mapping not found");
        }
        const portal = request.portalMasAccessId !== undefined || request.portalKey !== undefined
            ? await resolveMasterAccessRole({
                expectedType: "PORTAL",
                masAccessId: request.portalMasAccessId,
                resourceKey: request.portalKey,
            })
            : existing.portal;
        const menu = request.menuMasAccessId !== undefined || request.menuKey !== undefined
            ? await resolveMasterAccessRole({
                expectedType: "MENU",
                masAccessId: request.menuMasAccessId,
                resourceKey: request.menuKey,
            })
            : existing.menu;
        if (!portal || !menu) {
            throw new ResponseError(400, "Portal or menu resource not found");
        }
        const conflict = await prismaFlowly.portalMenuMap.findUnique({
            where: {
                portalMasAccessId_menuMasAccessId: {
                    portalMasAccessId: portal.masAccessId,
                    menuMasAccessId: menu.masAccessId,
                },
            },
            select: {
                portalMenuMapId: true,
                isDeleted: true,
            },
        });
        if (conflict && conflict.portalMenuMapId !== request.portalMenuMapId) {
            if (conflict.isDeleted) {
                throw new ResponseError(400, "Deleted portal menu mapping already exists; restore it instead");
            }
            throw new ResponseError(400, "Portal menu mapping already exists");
        }
        const updated = await prismaFlowly.portalMenuMap.update({
            where: { portalMenuMapId: request.portalMenuMapId },
            data: {
                portalMasAccessId: portal.masAccessId,
                menuMasAccessId: menu.masAccessId,
                orderIndex: request.orderIndex ?? existing.orderIndex,
                isActive: request.isActive ?? existing.isActive,
                updatedAt: new Date(),
                updatedBy: requesterId,
            },
            include: portalMenuMapInclude,
        });
        return toPortalMenuMapResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(PortalMenuMapValidation.DELETE, reqBody);
        await ensureAdmin(requesterId);
        const existing = await prismaFlowly.portalMenuMap.findUnique({
            where: { portalMenuMapId: request.portalMenuMapId },
            select: {
                portalMenuMapId: true,
                isDeleted: true,
            },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Portal menu mapping not found");
        }
        const now = new Date();
        await prismaFlowly.portalMenuMap.update({
            where: { portalMenuMapId: request.portalMenuMapId },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        return { message: "Portal menu mapping deleted" };
    }
    static async list(requesterId, filters) {
        await ensureAdmin(requesterId);
        const where = {
            isDeleted: false,
        };
        if (filters?.portalMasAccessId || filters?.portalKey) {
            const portal = await resolveMasterAccessRole({
                expectedType: "PORTAL",
                masAccessId: filters.portalMasAccessId,
                resourceKey: filters.portalKey,
            });
            where.portalMasAccessId = portal.masAccessId;
        }
        if (filters?.menuMasAccessId || filters?.menuKey) {
            const menu = await resolveMasterAccessRole({
                expectedType: "MENU",
                masAccessId: filters.menuMasAccessId,
                resourceKey: filters.menuKey,
            });
            where.menuMasAccessId = menu.masAccessId;
        }
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        const list = await prismaFlowly.portalMenuMap.findMany({
            where,
            include: portalMenuMapInclude,
            orderBy: [
                { portalMasAccessId: "asc" },
                { orderIndex: "asc" },
                { portalMenuMapId: "asc" },
            ],
        });
        return list.map(toPortalMenuMapListResponse);
    }
}
//# sourceMappingURL=portal-menu-map-service.js.map