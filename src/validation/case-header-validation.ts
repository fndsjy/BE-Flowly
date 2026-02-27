import { z, ZodType } from "zod";
import {
  CASE_STATUSES,
  CASE_TYPES,
  CASE_VISIBILITIES,
  normalizeUpper,
} from "../utils/case-constants.js";

const caseTypeSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine((value) => CASE_TYPES.includes(value as typeof CASE_TYPES[number]), {
    message: "Invalid caseType",
  });

const caseStatusSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine((value) => CASE_STATUSES.includes(value as typeof CASE_STATUSES[number]), {
    message: "Invalid status",
  });

const caseVisibilitySchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine(
    (value) => CASE_VISIBILITIES.includes(value as typeof CASE_VISIBILITIES[number]),
    { message: "Invalid visibility" }
  );

export class CaseHeaderValidation {
  static readonly CREATE: ZodType = z.object({
    caseType: caseTypeSchema,
    caseTitle: z.string().min(1).max(200),
    background: z.string().max(1000).optional().nullable(),
    currentCondition: z.string().max(2000).optional().nullable(),
    projectDesc: z.string().max(2000).optional().nullable(),
    projectObjective: z.string().max(1000).optional().nullable(),
    locationDesc: z.string().max(255).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    originSbuSubId: z.number().int().min(1).optional(),
    visibility: caseVisibilitySchema.optional(),
    departmentSbuSubIds: z.array(z.number().int().min(1)).min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
    caseType: caseTypeSchema.optional(),
    caseTitle: z.string().max(200).optional(),
    background: z.string().max(1000).optional().nullable(),
    currentCondition: z.string().max(2000).optional().nullable(),
    projectDesc: z.string().max(2000).optional().nullable(),
    projectObjective: z.string().max(1000).optional().nullable(),
    locationDesc: z.string().max(255).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    status: caseStatusSchema.optional(),
    originSbuSubId: z.number().int().min(1).optional().nullable(),
    visibility: caseVisibilitySchema.optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
  });
}
