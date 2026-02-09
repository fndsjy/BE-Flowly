import { z, ZodType } from "zod";

export class FishboneCategoryValidation {
  static readonly CREATE: ZodType = z.object({
    categoryCode: z.string().min(1).max(20),
    categoryName: z.string().min(1).max(100),
    categoryDesc: z.string().max(255).optional().nullable(),
  });

  static readonly UPDATE: ZodType = z.object({
    fishboneCategoryId: z.string().min(1).max(20),
    categoryCode: z.string().max(20).optional(),
    categoryName: z.string().max(100).optional(),
    categoryDesc: z.string().max(255).optional().nullable(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    fishboneCategoryId: z.string().min(1).max(20),
  });
}
