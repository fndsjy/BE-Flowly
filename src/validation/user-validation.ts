import { z, ZodType } from "zod";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();
const optionalRequiredText = (max: number) =>
  z.string().trim().min(1).max(max).optional();
const optionalNullableDate = z.union([z.coerce.date(), z.null()]).optional();
const isFutureDate = (value: Date) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return value.getTime() > today.getTime();
};

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(3).max(30),
    name: z.string().min(1).max(100),
    password: z.string().min(6).max(100),
    cardNumber: z.string().min(1, "Card number is required"),
    roleId: z.string().optional(),
  });

  static readonly LOGIN: ZodType = z.object({
    identity: z.string().trim().min(1).optional(),
    username: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    cardNo: z.string().trim().min(1).optional(),
    password: z.string().min(1),
  }).superRefine((data, ctx) => {
    const hasIdentity = Boolean(data.identity);
    const hasUsername = Boolean(data.username);
    const hasEmail = Boolean(data.email);
    const hasCardNo = Boolean(data.cardNo);
    const identityCount = [hasIdentity, hasUsername, hasEmail, hasCardNo].filter(Boolean).length;

    if (identityCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one login identity",
      });
    }

    if (data.identity && !data.identity.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identity"],
        message: "Identity is required",
      });
    }
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  });

  static readonly UPDATE_PROFILE: ZodType = z
    .object({
      name: optionalRequiredText(40),
      cardNumber: optionalRequiredText(24),
      gender: optionalRequiredText(8),
      nik: optionalRequiredText(20),
      birthDay: z.coerce.date().optional(),
      religion: optionalRequiredText(50),
      hireDay: z.coerce.date().optional(),
      street: optionalText(255),
      city: optionalText(200),
      state: optionalRequiredText(100),
      email: z.union([z.string().trim().email().max(80), z.literal(""), z.null()]).optional(),
      phone: optionalText(20),
      departmentId: z.number().int().positive().optional().nullable(),
      isMem: z.boolean().optional().nullable(),
      isMemDate: optionalNullableDate,
      imgName: optionalText(255),
      tipe: optionalRequiredText(50),
      location: optionalRequiredText(100),
      statusLMS: z.boolean().optional(),
      bpjsKesehatan: optionalText(50),
      bpjsKetenagakerjaan: optionalText(50),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.birthDay && isFutureDate(data.birthDay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthDay"],
          message: "Tanggal lahir tidak boleh melebihi hari ini",
        });
      }
    });

  static readonly CHANGE_ROLE: ZodType = z.object({
    userId: z.string().min(1).max(20),
    newRoleId: z.string().min(1).max(20),
  });
}
