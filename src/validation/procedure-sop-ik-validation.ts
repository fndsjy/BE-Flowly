import { z, ZodType } from "zod";

const IdSchema = z.string().min(1).max(20);

export class ProcedureSopIkValidation {
  static readonly CREATE: ZodType = z.object({
    sopId: IdSchema,
    ikIds: z.array(IdSchema).min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    sopIkId: IdSchema,
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    sopIkId: IdSchema,
  });
}
