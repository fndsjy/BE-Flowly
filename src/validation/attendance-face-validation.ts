import { z, ZodType } from "zod";

const faceDescriptor = z.array(z.number().finite()).length(128);
const optionalImageData = z.string().trim().max(5_000_000).optional().nullable();

export class AttendanceFaceValidation {
  static readonly ENROLL: ZodType = z
    .object({
      userId: z.number().int().positive().optional(),
      badgeNum: z.string().trim().min(1).max(50).optional(),
      faceDescriptor,
      faceImage: optionalImageData,
    })
    .refine((value) => Boolean(value.userId || value.badgeNum), {
      message: "Badge number is required",
      path: ["badgeNum"],
    });

  static readonly DELETE_PROFILE: ZodType = z.object({
    userId: z.number().int().positive(),
  });

  static readonly SCAN_SUCCESS: ZodType = z.object({
    faceDescriptor,
  });

  static readonly MATCH_PROFILE: ZodType = z.object({
    faceDescriptor,
  });

  static readonly SCAN_FAILURE: ZodType = z.object({
    scanStatus: z.enum(["FAILED", "SPOOF"]),
    spoofType: z
      .enum(["PHOTO", "VIDEO_REPLAY", "HANDPHONE", "PROFILE_MISMATCH"])
      .optional()
      .nullable(),
    failureReason: z.string().trim().min(1).max(500),
  });
}
