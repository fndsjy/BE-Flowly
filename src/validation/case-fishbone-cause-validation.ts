import { z, ZodType } from "zod";

export class CaseFishboneCauseValidation {
  static readonly CREATE: ZodType = z.object({
    caseFishboneId: z.string().min(1).max(20),
    causeNo: z.number().int().min(1),
    causeText: z.string().min(1).max(1000),
  });

  static readonly UPDATE: ZodType = z.object({
    caseFishboneCauseId: z.string().min(1).max(20),
    causeNo: z.number().int().min(1).optional(),
    causeText: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseFishboneCauseId: z.string().min(1).max(20),
  });
}
