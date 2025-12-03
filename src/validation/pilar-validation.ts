import { z, ZodType } from "zod";

export class PilarValidation {

  static readonly CREATE: ZodType = z.object({
    pilarName: z.string().min(1, "Pilar name is required"),
    description: z.string().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1),
    pilarName: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),  // "0" / "1"
  });

  static readonly DELETE: ZodType = z.object({
    id: z.number().min(1),
  });
}
