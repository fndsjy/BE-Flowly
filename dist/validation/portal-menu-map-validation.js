import { z, ZodType } from "zod";
const portalTargetSchema = z.object({
    portalMasAccessId: z.string().max(20).optional().nullable(),
    portalKey: z.string().max(50).optional().nullable(),
});
const menuTargetSchema = z.object({
    menuMasAccessId: z.string().max(20).optional().nullable(),
    menuKey: z.string().max(50).optional().nullable(),
});
export class PortalMenuMapValidation {
    static CREATE = portalTargetSchema
        .merge(menuTargetSchema)
        .extend({
        orderIndex: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
    })
        .refine((data) => Boolean(data.portalMasAccessId) || Boolean(data.portalKey), { message: "portalMasAccessId or portalKey is required" })
        .refine((data) => Boolean(data.menuMasAccessId) || Boolean(data.menuKey), { message: "menuMasAccessId or menuKey is required" });
    static UPDATE = z
        .object({
        portalMenuMapId: z.string().min(1).max(20),
        portalMasAccessId: z.string().max(20).optional().nullable(),
        portalKey: z.string().max(50).optional().nullable(),
        menuMasAccessId: z.string().max(20).optional().nullable(),
        menuKey: z.string().max(50).optional().nullable(),
        orderIndex: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
    })
        .refine((data) => data.portalMasAccessId !== undefined ||
        data.portalKey !== undefined ||
        data.menuMasAccessId !== undefined ||
        data.menuKey !== undefined ||
        data.orderIndex !== undefined ||
        data.isActive !== undefined, { message: "No fields to update" });
    static DELETE = z.object({
        portalMenuMapId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=portal-menu-map-validation.js.map