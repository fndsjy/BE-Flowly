import { z, ZodType } from "zod";
const nullableDate = z.union([z.coerce.date(), z.null()]);
const requiredText = (max) => z.string().trim().min(1).max(max);
const optionalTrimmedText = (max) => z.string().trim().max(max).optional().nullable();
export class EmployeeValidation {
    static CREATE = z
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
        Shift: z.number().int().optional().nullable(),
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
        if (data.CardNo !== data.BadgeNum) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["CardNo"],
                message: "Card number harus sama dengan badge number",
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
    static UPDATE = z
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
        Shift: z.number().int().optional().nullable(),
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
        if (data.CardNo !== data.BadgeNum) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["CardNo"],
                message: "Card number harus sama dengan badge number",
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
    static DELETE = z.object({
        userId: z.number().int().positive(),
    });
    static UPDATE_JOB_DESC = z.object({
        userId: z.number().int().positive(),
        jobDesc: z.string().max(500).nullable(),
    });
}
//# sourceMappingURL=employee-validation.js.map