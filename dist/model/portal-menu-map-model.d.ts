import type { PortalMenuMap } from "../generated/flowly/client.js";
type PortalMenuMapResource = {
    masAccessId: string;
    resourceKey: string;
    displayName: string;
    route: string | null;
    isActive: boolean;
    isDeleted: boolean;
};
type PortalMenuMapWithRelations = PortalMenuMap & {
    portal?: PortalMenuMapResource | null;
    menu?: PortalMenuMapResource | null;
};
export type PortalMenuMapResponse = {
    portalMenuMapId: string;
    portalMasAccessId: string;
    portalKey: string | null;
    portalDisplayName: string | null;
    portalRoute: string | null;
    menuMasAccessId: string;
    menuKey: string | null;
    menuDisplayName: string | null;
    menuRoute: string | null;
    orderIndex: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type PortalMenuMapListResponse = PortalMenuMapResponse;
export type CreatePortalMenuMapRequest = {
    portalMasAccessId?: string | null;
    portalKey?: string | null;
    menuMasAccessId?: string | null;
    menuKey?: string | null;
    orderIndex?: number;
    isActive?: boolean;
};
export type UpdatePortalMenuMapRequest = {
    portalMenuMapId: string;
    portalMasAccessId?: string | null;
    portalKey?: string | null;
    menuMasAccessId?: string | null;
    menuKey?: string | null;
    orderIndex?: number;
    isActive?: boolean;
};
export type DeletePortalMenuMapRequest = {
    portalMenuMapId: string;
};
export declare function toPortalMenuMapResponse(mapping: PortalMenuMapWithRelations): PortalMenuMapResponse;
export declare const toPortalMenuMapListResponse: typeof toPortalMenuMapResponse;
export {};
//# sourceMappingURL=portal-menu-map-model.d.ts.map