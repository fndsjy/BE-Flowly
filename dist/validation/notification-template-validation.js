import { z, ZodType } from "zod";
const normalizeUpper = (value) => value.trim().toUpperCase();
const channelSchema = z
    .string()
    .min(1)
    .max(20)
    .transform(normalizeUpper)
    .refine((value) => value === "WHATSAPP" || value === "EMAIL", {
    message: "Invalid channel",
});
const eventKeySchema = z
    .string()
    .min(1)
    .max(50)
    .transform(normalizeUpper)
    .refine((value) => /^[A-Z0-9_]+$/.test(value), {
    message: "Invalid eventKey",
});
const recipientRoleSchema = z
    .string()
    .min(1)
    .max(30)
    .transform(normalizeUpper)
    .refine((value) => /^[A-Z0-9_]+$/.test(value), {
    message: "Invalid recipientRole",
});
const portalKeySchema = z
    .string()
    .min(1)
    .max(50)
    .transform(normalizeUpper)
    .refine((value) => /^[A-Z0-9_]+$/.test(value), {
    message: "Invalid portalKey",
});
const portalKeysSchema = z.array(portalKeySchema).max(20);
export class NotificationTemplateValidation {
    static CREATE = z.object({
        templateName: z.string().min(1).max(100),
        channel: channelSchema,
        eventKey: eventKeySchema,
        recipientRole: recipientRoleSchema,
        messageTemplate: z.string().min(1).max(1000),
        portalKeys: portalKeysSchema.optional(),
        isActive: z.boolean().optional(),
    });
    static UPDATE = z.object({
        notificationTemplateId: z.string().min(1).max(20),
        templateName: z.string().min(1).max(100).optional(),
        channel: channelSchema.optional(),
        eventKey: eventKeySchema.optional(),
        recipientRole: recipientRoleSchema.optional(),
        messageTemplate: z.string().min(1).max(1000).optional(),
        portalKeys: portalKeysSchema.optional(),
        isActive: z.boolean().optional(),
    });
    static DELETE = z.object({
        notificationTemplateId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=notification-template-validation.js.map