import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

export const generateToken = (user: Pick<User, "userId" | "username" | "roleId">) => {
  return jwt.sign(
    { userId: user.userId, username: user.username, roleId: user.roleId },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "3h" }
  );
};

// Helper to get token expiration time (in seconds or ms)
export const getTokenExpiresIn = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now); // in seconds
  } catch {
    return 0;
  }
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || "supersecret") as {
    userId: string;
    username: string;
    roleId: string;
    exp: number; // include exp for type safety
  };
};