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
        username: z.string().min(1),
        password: z.string().min(1),
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