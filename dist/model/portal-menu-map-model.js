export function toPortalMenuMapResponse(mapping) {
    return {
        portalMenuMapId: mapping.portalMenuMapId,
        portalMasAccessId: mapping.portalMasAccessId,
        portalKey: mapping.portal?.resourceKey ?? null,
        portalDisplayName: mapping.portal?.displayName ?? null,
        portalRoute: mapping.portal?.route ?? null,
        menuMasAccessId: mapping.menuMasAccessId,
        menuKey: mapping.menu?.resourceKey ?? null,
        menuDisplayName: mapping.menu?.displayName ?? null,
        menuRoute: mapping.menu?.route ?? null,
        orderIndex: mapping.orderIndex ?? 0,
        isActive: mapping.isActive ?? true,
        isDeleted: mapping.isDeleted ?? false,
        createdAt: mapping.createdAt,
        updatedAt: mapping.updatedAt,
    };
}
export const toPortalMenuMapListResponse = toPortalMenuMapResponse;
//# sourceMappingURL=portal-menu-map-model.js.map