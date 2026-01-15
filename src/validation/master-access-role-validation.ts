import { z, ZodType } from "zod";

export class MasterAccessRoleValidation {
  static readonly CREATE: ZodType = z.object({
    resourceType: z.string().min(1).max(20),
    resourceKey: z.string().min(1).max(50),
    displayName: z.string().min(1).max(100),
    route: z.string().max(200).optional().nullable(),
    parentKey: z.string().max(50).optional().nullable(),
    orderIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    masAccessId: z.string().min(1).max(20),
    resourceType: z.string().min(1).max(20).optional(),
    resourceKey: z.string().min(1).max(50).optional(),
    displayName: z.string().min(1).max(100).optional(),
    route: z.string().max(200).optional().nullable(),
    parentKey: z.string().max(50).optional().nullable(),
    orderIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    masAccessId: z.string().min(1).max(20),
  });
}
