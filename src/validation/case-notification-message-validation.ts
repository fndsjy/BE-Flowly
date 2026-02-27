import { z, ZodType } from "zod";
import { normalizeUpper } from "../utils/case-constants.js";

const roleSchema = z
  .string()
  .min(1)
  .max(20)
  .transform(normalizeUpper)
  .refine((value) => ["PIC", "ASSIGNEE", "REQUESTER"].includes(value), {
    message: "Invalid role",
  });

export class CaseNotificationMessageValidation {
  static readonly CREATE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
    caseDepartmentId: z.string().min(1).max(20).optional().nullable(),
    recipientEmployeeId: z.number().int().min(1),
    role: roleSchema,
    messageTemplate: z.string().min(1).max(1000),
    isActive: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    caseNotificationMessageId: z.string().min(1).max(20),
    messageTemplate: z.string().min(1).max(1000).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseNotificationMessageId: z.string().min(1).max(20),
  });
}
