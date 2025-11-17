import type { User } from "@prisma/client";
export declare const generateToken: (user: Pick<User, "userId" | "username" | "roleId">) => string;
export declare const verifyToken: (token: string) => {
    userId: string;
    username: string;
    roleId: string;
};
//# sourceMappingURL=auth.d.ts.map