import { z, ZodType } from "zod";

export class MasterIkValidation {
  static readonly CREATE: ZodType = z.object({
    ikName: z.string().min(1).max(150),
    ikNumber: z.string().min(1).max(50),
    effectiveDate: z.coerce.date(),
    ikContent: z.string().optional().nullable(),
    dibuatOleh: z.number().int().min(1).optional().nullable(),
    diketahuiOleh: z.number().int().min(1).optional().nullable(),
    disetujuiOleh: z.number().int().min(1).optional().nullable(),
    sopIds: z.array(z.string().min(1).max(20)).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    ikId: z.string().min(1).max(20),
    ikName: z.string().max(150).optional(),
    ikNumber: z.string().max(50).optional(),
    effectiveDate: z.coerce.date().optional(),
    ikContent: z.string().optional().nullable(),
    dibuatOleh: z.number().int().min(1).optional().nullable(),
    diketahuiOleh: z.number().int().min(1).optional().nullable(),
    disetujuiOleh: z.number().int().min(1).optional().nullable(),
    isActive: z.boolean().optional(),
    sopIds: z.array(z.string().min(1).max(20)).optional(),
  });

  static readonly DELETE: ZodType = z.object({
    ikId: z.string().min(1).max(20),
  });
}
