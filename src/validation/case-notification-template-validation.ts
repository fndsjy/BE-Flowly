import { z, ZodType } from "zod";
import { CASE_TYPES, normalizeUpper } from "../utils/case-constants.js";

const roleSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine((value) => ["PIC", "ASSIGNEE"].includes(value), {
    message: "Invalid role",
  });

const channelSchema = z.string().min(1).max(20).transform(normalizeUpper);
const actionSchema = z.string().min(1).max(30).transform(normalizeUpper);
const caseTypeSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine((value) => CASE_TYPES.includes(value as (typeof CASE_TYPES)[number]), {
    message: "Invalid caseType",
  });

export class CaseNotificationTemplateValidation {
  static readonly CREATE: ZodType = z.object({
    templateName: z.string().min(1).max(100),
    channel: channelSchema,
    role: roleSchema,
    action: actionSchema.optional().nullable(),
    caseType: caseTypeSchema.optional().nullable(),
    messageTemplate: z.string().min(1).max(1000),
    isActive: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    caseNotificationTemplateId: z.string().min(1).max(20),
    templateName: z.string().min(1).max(100).optional(),
    channel: channelSchema.optional(),
    role: roleSchema.optional(),
    action: actionSchema.optional().nullable(),
    caseType: caseTypeSchema.optional().nullable(),
    messageTemplate: z.string().min(1).max(1000).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseNotificationTemplateId: z.string().min(1).max(20),
  });
}
