import { type CreatePortalMenuMapRequest, type DeletePortalMenuMapRequest, type UpdatePortalMenuMapRequest } from "../model/portal-menu-map-model.js";
export declare class PortalMenuMapService {
    static create(requesterId: string, reqBody: CreatePortalMenuMapRequest): Promise<import("../model/portal-menu-map-model.js").PortalMenuMapResponse>;
    static update(requesterId: string, reqBody: UpdatePortalMenuMapRequest): Promise<import("../model/portal-menu-map-model.js").PortalMenuMapResponse>;
    static softDelete(requesterId: string, reqBody: DeletePortalMenuMapRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        portalMasAccessId?: string;
        portalKey?: string;
        menuMasAccessId?: string;
        menuKey?: string;
        isActive?: boolean;
    }): Promise<import("../model/portal-menu-map-model.js").PortalMenuMapResponse[]>;
}
//# sourceMappingURL=portal-menu-map-service.d.ts.map