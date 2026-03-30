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

export function toPortalMenuMapResponse(
  mapping: PortalMenuMapWithRelations
): PortalMenuMapResponse {
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
