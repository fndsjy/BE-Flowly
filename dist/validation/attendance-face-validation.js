import { z, ZodType } from "zod";
const faceDescriptor = z.array(z.number().finite()).length(128);
const optionalImageData = z.string().trim().max(5_000_000).optional().nullable();
export class AttendanceFaceValidation {
    static ENROLL = z
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
    static DELETE_PROFILE = z.object({
        userId: z.number().int().positive(),
    });
    static SCAN_SUCCESS = z.object({
        faceDescriptor,
    });
    static MATCH_PROFILE = z.object({
        faceDescriptor,
    });
    static SCAN_FAILURE = z.object({
        scanStatus: z.enum(["FAILED", "SPOOF"]),
        spoofType: z
            .enum(["PHOTO", "VIDEO_REPLAY", "HANDPHONE", "PROFILE_MISMATCH"])
            .optional()
            .nullable(),
        failureReason: z.string().trim().min(1).max(500),
    });
}
//# sourceMappingURL=attendance-face-validation.js.map