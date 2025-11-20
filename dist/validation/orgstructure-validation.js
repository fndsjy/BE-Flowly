import { z, ZodType } from "zod";
export class OrgStructureValidation {
    static CREATE = z.object({
        name: z.string().min(1, "Structure name is required"),
        description: z.string().optional(),
    });
    static UPDATE = z.object({
        structureId: z.string().min(1),
        name: z.string().optional(),
        description: z.string().optional(),
    });
    static DELETE = z.object({
        structureId: z.string().min(1),
    });
}
//# sourceMappingURL=orgstructure-validation.js.map