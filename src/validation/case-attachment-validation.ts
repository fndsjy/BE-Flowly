import { z, ZodType } from "zod";
import { CASE_MEDIA_TYPES, normalizeUpper } from "../utils/case-constants.js";

const mediaTypeSchema = z
  .string()
  .min(1)
  .max(10)
  .transform(normalizeUpper)
  .refine(
    (value) => CASE_MEDIA_TYPES.includes(value as typeof CASE_MEDIA_TYPES[number]),
    { message: "Invalid mediaType" }
  );

export class CaseAttachmentValidation {
  static readonly CREATE: ZodType = z.object({
    caseId: z.string().min(1).max(20),
    mediaType: mediaTypeSchema,
    filePath: z.string().min(1).max(500).optional(),
    fileName: z.string().min(1).max(255).optional(),
    fileData: z.string().min(1).optional(),
    fileMime: z.string().max(100).optional().nullable(),
    fileSize: z.number().int().min(0).optional().nullable(),
    caption: z.string().max(255).optional().nullable(),
    locationDesc: z.string().max(255).optional().nullable(),
    orderIndex: z.number().int().min(0).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    caseAttachmentId: z.string().min(1).max(20),
    mediaType: mediaTypeSchema.optional(),
    filePath: z.string().max(500).optional(),
    fileName: z.string().max(255).optional(),
    fileData: z.string().min(1).optional(),
    fileMime: z.string().max(100).optional().nullable(),
    fileSize: z.number().int().min(0).optional().nullable(),
    caption: z.string().max(255).optional().nullable(),
    locationDesc: z.string().max(255).optional().nullable(),
    orderIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  });

  static readonly DELETE: ZodType = z.object({
    caseAttachmentId: z.string().min(1).max(20),
  });
}
