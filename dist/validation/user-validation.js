import { z, ZodType } from "zod";
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
        badgeNumber: z.string().trim().min(1).optional(),
        password: z.string().min(1),
    }).superRefine((data, ctx) => {
        const hasUsername = Boolean(data.username);
        const hasBadgeNumber = Boolean(data.badgeNumber);
        if (hasUsername === hasBadgeNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Provide either username or badge number",
            });
        }
    });
    static CHANGE_PASSWORD = z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6).max(100),
    });
    static CHANGE_ROLE = z.object({
        userId: z.string().min(1).max(20),
        newRoleId: z.string().min(1).max(20),
    });
}
//# sourceMappingURL=user-validation.js.map