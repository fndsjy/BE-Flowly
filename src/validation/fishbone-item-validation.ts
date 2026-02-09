import { z, ZodType } from "zod";

export class FishboneItemValidation {
  static readonly CREATE: ZodType = z.object({
    fishboneId: z.string().min(1).max(20),
    categoryCode: z.string().min(1).max(20),
    problemText: z.string().min(1).max(1000),
    solutionText: z.string().min(1).max(1000),
    causeIds: z.array(z.string().min(1).max(20)).min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    fishboneItemId: z.string().min(1).max(20),
    categoryCode: z.string().max(20).optional(),
    problemText: z.string().max(1000).optional(),
    solutionText: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
    causeIds: z.array(z.string().min(1).max(20)).min(1).optional(),
  });

  static readonly DELETE: ZodType = z.object({
    fishboneItemId: z.string().min(1).max(20),
  });
}
