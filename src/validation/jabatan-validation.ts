import { z, ZodType } from "zod";

export class JabatanValidation {
  static readonly CREATE: ZodType = z.object({
    jabatanName: z.string().min(1).max(100),
    jabatanLevel: z.number().int().positive().optional(),
    jabatanDesc: z.string().max(255).optional().nullable(),
    jabatanIsActive: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    jabatanId: z.string().min(1).max(20),
    jabatanName: z.string().min(1).max(100).optional(),
    jabatanLevel: z.number().int().positive().optional(),
    jabatanDesc: z.string().max(255).optional().nullable(),
    jabatanIsActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    jabatanId: z.string().min(1).max(20),
  });
}
