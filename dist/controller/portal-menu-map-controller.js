import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { PortalMenuMapService } from "../service/portal-menu-map-service.js";
const parseBooleanQuery = (value) => {
    if (typeof value !== "string") {
        return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
        return true;
    }
    if (normalized === "false" || normalized === "0") {
        return false;
    }
    return undefined;
};
export class PortalMenuMapController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await PortalMenuMapService.create(payload.userId, req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await PortalMenuMapService.update(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async softDelete(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await PortalMenuMapService.softDelete(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const portalMasAccessId = typeof req.query.portalMasAccessId === "string"
                ? req.query.portalMasAccessId
                : undefined;
            const portalKey = typeof req.query.portalKey === "string"
                ? req.query.portalKey
                : undefined;
            const menuMasAccessId = typeof req.query.menuMasAccessId === "string"
                ? req.query.menuMasAccessId
                : undefined;
            const menuKey = typeof req.query.menuKey === "string"
                ? req.query.menuKey
                : undefined;
            const isActive = parseBooleanQuery(req.query.isActive);
            const response = await PortalMenuMapService.list(payload.userId, {
                ...(portalMasAccessId ? { portalMasAccessId } : {}),
                ...(portalKey ? { portalKey } : {}),
                ...(menuMasAccessId ? { menuMasAccessId } : {}),
                ...(menuKey ? { menuKey } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
            });
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=portal-menu-map-controller.js.map