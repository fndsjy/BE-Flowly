import { z, ZodType } from "zod";

export class OrgStructureValidation {

  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1, "Structure name is required"),
    description: z.string().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    structureId: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    structureId: z.string().min(1),
  });
}
