// src/utils/auth.ts
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

export const generateToken = (user: Pick<User, "userId" | "username" | "roleId">) => {
  return jwt.sign(
    { userId: user.userId, username: user.username, roleId: user.roleId },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || "supersecret") as {
    userId: string;
    username: string;
    roleId: string;
  };
};