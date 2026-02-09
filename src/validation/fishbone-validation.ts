import { z, ZodType } from "zod";

export class FishboneValidation {
  static readonly CREATE: ZodType = z.object({
    sbuSubId: z.number().int().min(1),
    fishboneName: z.string().min(1).max(150),
    fishboneDesc: z.string().max(1000).optional().nullable(),
  });

  static readonly UPDATE: ZodType = z.object({
    fishboneId: z.string().min(1).max(20),
    sbuSubId: z.number().int().min(1).optional(),
    fishboneName: z.string().max(150).optional(),
    fishboneDesc: z.string().max(1000).optional().nullable(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    fishboneId: z.string().min(1).max(20),
  });
}
