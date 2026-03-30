import { z, ZodType } from "zod";
const optionalText = (max) => z.union([z.string().trim().max(max), z.null()]).optional();
const optionalRequiredText = (max) => z.string().trim().min(1).max(max).optional();
const optionalNullableDate = z.union([z.coerce.date(), z.null()]).optional();
export class UserValidation {
    static REGISTER = z.object({
        username: z.string().min(3).max(30),
        name: z.string().min(1).max(100),
        password: z.string().min(6).max(100),
        badgeNumber: z.string().min(1, "Badge number is required"),
        roleId: z.string().optional(),
    });
    static LOGIN = z.object({
        username: z.string().trim().min(1).optional(),
        cardNo: z.string().trim().min(1).optional(),
        password: z.string().min(1),
    }).superRefine((data, ctx) => {
        const hasUsername = Boolean(data.username);
        const hasCardNo = Boolean(data.cardNo);
        if (hasUsername === hasCardNo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Provide either username or card number",
            });
        }
    });
    static CHANGE_PASSWORD = z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6).max(100),
    });
    static UPDATE_PROFILE = z.object({
        name: optionalRequiredText(40),
        badgeNumber: optionalRequiredText(24),
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
    }).strict();
    static CHANGE_ROLE = z.object({
        userId: z.string().min(1).max(20),
        newRoleId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=user-validation.js.map