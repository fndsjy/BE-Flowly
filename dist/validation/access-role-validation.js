import { z, ZodType } from "zod";
export class AccessRoleValidation {
    static CREATE = z
        .object({
        subjectType: z.string().min(1).max(10),
        subjectId: z.string().min(1).max(20),
        resourceType: z.string().min(1).max(20),
        masAccessId: z.string().max(20).optional().nullable(),
        resourceKey: z.string().max(50).optional().nullable(),
        accessLevel: z.enum(["READ", "CRUD"]),
        isActive: z.boolean().optional(),
    })
        .refine((data) => Boolean(data.masAccessId) || Boolean(data.resourceKey), { message: "masAccessId or resourceKey is required" });
    static UPDATE = z
        .object({
        accessId: z.string().min(1).max(20),
        subjectType: z.string().min(1).max(10).optional(),
        subjectId: z.string().min(1).max(20).optional(),
        resourceType: z.string().min(1).max(20).optional(),
        masAccessId: z.string().max(20).optional().nullable(),
        resourceKey: z.string().max(50).optional().nullable(),
        accessLevel: z.enum(["READ", "CRUD"]).optional(),
        isActive: z.boolean().optional(),
    })
        .refine((data) => data.masAccessId !== undefined ||
        data.resourceKey !== undefined ||
        data.resourceType !== undefined ||
        data.subjectType !== undefined ||
        data.subjectId !== undefined ||
        data.accessLevel !== undefined ||
        data.isActive !== undefined, { message: "No fields to update" });
    static DELETE = z.object({
        accessId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=access-role-validation.js.map