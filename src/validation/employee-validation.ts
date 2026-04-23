import { z, ZodType } from "zod";

const nullableDate = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    return value;
  },
  z.union([z.null(), z.coerce.date()])
);
const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalTrimmedText = (max: number) => z.string().trim().max(max).optional().nullable();
const optionalShiftFlag = z.union([z.literal(0), z.literal(1)]).optional().nullable();
const isFutureDate = (value: Date) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return value.getTime() > today.getTime();
};

export class EmployeeValidation {
  static readonly CREATE: ZodType = z
    .object({
    BadgeNum: requiredText(24),
    Name: requiredText(40),
    Gender: requiredText(8),
    BirthDay: z.coerce.date(),
    HireDay: z.coerce.date(),
    Street: requiredText(255),
    Religion: requiredText(50),
    Tipe: requiredText(50),
    isLokasi: requiredText(100),
    Phone: requiredText(20),
    DeptId: z.number().int().positive(),
    CardNo: requiredText(20),
    Shift: optionalShiftFlag,
    isMem: z.boolean().optional().nullable(),
    SbuSub: z.number().int().positive().optional().nullable(),
    isMemDate: nullableDate.optional(),
    Nik: requiredText(20),
    ResignDate: nullableDate.optional(),
    statusLMS: z.string().min(1).max(1).optional(),
    roleId: z.number().int().positive().optional().nullable(),
    jobDesc: optionalTrimmedText(500),
    city: requiredText(200),
    state: requiredText(100),
    email: z.string().trim().email().max(80),
    IPMsnFinger: requiredText(100),
    BPJSKshtn: optionalTrimmedText(50),
    BPJSKtngkerjaan: optionalTrimmedText(50),
  })
    .superRefine((data, ctx) => {
      if (isFutureDate(data.BirthDay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["BirthDay"],
          message: "Tanggal lahir tidak boleh melebihi hari ini",
        });
      }

      if (data.CardNo !== data.BadgeNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CardNo"],
          message: "Card number tidak sinkron dengan nomor internal",
        });
      }

      if (data.isMem === true && !data.isMemDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isMemDate"],
          message: "Tanggal hafal IBADAH wajib diisi saat status hafal aktif",
        });
      }
    });

  static readonly UPDATE: ZodType = z
    .object({
    userId: z.number().int().positive(),
    BadgeNum: requiredText(24),
    Name: requiredText(40),
    Gender: requiredText(8),
    BirthDay: z.coerce.date(),
    HireDay: z.coerce.date(),
    Street: requiredText(255),
    Religion: requiredText(50),
    Tipe: requiredText(50),
    isLokasi: requiredText(100),
    Phone: requiredText(20),
    DeptId: z.number().int().positive(),
    CardNo: requiredText(20),
    Shift: optionalShiftFlag,
    isMem: z.boolean().optional().nullable(),
    SbuSub: z.number().int().positive().optional().nullable(),
    isMemDate: nullableDate.optional(),
    Nik: requiredText(20),
    ResignDate: nullableDate.optional(),
    statusLMS: z.string().min(1).max(1).optional(),
    roleId: z.number().int().positive().optional().nullable(),
    jobDesc: optionalTrimmedText(500),
    city: requiredText(200),
    state: requiredText(100),
    email: z.string().trim().email().max(80),
    IPMsnFinger: requiredText(100),
    BPJSKshtn: optionalTrimmedText(50),
    BPJSKtngkerjaan: optionalTrimmedText(50),
  })
    .superRefine((data, ctx) => {
      if (isFutureDate(data.BirthDay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["BirthDay"],
          message: "Tanggal lahir tidak boleh melebihi hari ini",
        });
      }

      if (data.CardNo !== data.BadgeNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CardNo"],
          message: "Card number tidak sinkron dengan nomor internal",
        });
      }

      if (data.isMem === true && !data.isMemDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isMemDate"],
          message: "Tanggal hafal IBADAH wajib diisi saat status hafal aktif",
        });
      }
    });

  static readonly DELETE: ZodType = z.object({
    userId: z.number().int().positive(),
  });

  static readonly UPDATE_JOB_DESC: ZodType = z.object({
    userId: z.number().int().positive(),
    jobDesc: z.string().max(500).nullable(),
  });
}
