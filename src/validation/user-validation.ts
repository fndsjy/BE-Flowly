import { z, ZodType } from "zod";

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(3).max(30),
    name: z.string().min(1).max(100),
    password: z.string().min(6).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  });

  static readonly CHANGE_ROLE: ZodType = z.object({
    userId: z.string().min(1).max(20),
    newRoleId: z.string().min(1).max(20),
  });
}