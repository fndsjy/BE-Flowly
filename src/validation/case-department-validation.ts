import { z, ZodType } from "zod";
import {
  CASE_DECISION_STATUSES,
  CASE_WORK_STATUSES,
  normalizeUpper,
} from "../utils/case-constants.js";

const decisionStatusSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine(
    (value) =>
      CASE_DECISION_STATUSES.includes(
        value as typeof CASE_DECISION_STATUSES[number]
      ),
    { message: "Invalid decisionStatus" }
  );

const workStatusSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine(
    (value) =>
      CASE_WORK_STATUSES.includes(value as typeof CASE_WORK_STATUSES[number]),
    { message: "Invalid workStatus" }
  );

export class CaseDepartmentValidation {
  static readonly CREATE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
    sbuSubId: z.number().int().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    caseDepartmentId: z.string().min(1).max(20),
    decisionStatus: decisionStatusSchema.optional(),
    assigneeEmployeeId: z.number().int().min(1).optional().nullable(),
    workStatus: workStatusSchema.optional().nullable(),
    startDate: z.union([z.string(), z.date()]).optional().nullable(),
    targetDate: z.union([z.string(), z.date()]).optional().nullable(),
    endDate: z.union([z.string(), z.date()]).optional().nullable(),
    workNotes: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseDepartmentId: z.string().min(1).max(20),
  });
}
