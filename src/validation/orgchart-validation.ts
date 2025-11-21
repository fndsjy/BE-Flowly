// validation/orgchart-validation.ts
import { z, ZodType } from "zod";

export class OrgChartValidation {
  
  static readonly CREATE: ZodType = z.object({
    structureId: z.string().min(1, "Structure ID is required"),
    parentId: z.string().nullable().optional(),
    name: z.string().min(1, "Name is required"),
    position: z.string().min(1, "Position is required"),
    userId: z.string().nullable().optional(),
    orderIndex: z.number().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    nodeId: z.string().min(1, "Node ID is required"),
    structureId: z.string().optional(),
    parentId: z.string().nullable().optional(),
    name: z.string().optional(),
    position: z.string().optional(),
    userId: z.string().nullable().optional(),
    orderIndex: z.number().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    nodeId: z.string().min(1),
  });
}
