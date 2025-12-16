// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateUserId, generateRoleId } from "../src/utils/id-generator.ts";

const prisma = new PrismaClient();

// 🔹 Daftar Role
const roles = [
  {
    roleName: "Admin",
    roleLevel: 1,
    roleDesc: "System administrator with full access",
  },
  {
    roleName: "Supervisor",
    roleLevel: 2,
    roleDesc: "Department administrator with user & content management",
  },
  {
    roleName: "Operator",
    roleLevel: 3,
    roleDesc: "Content creator and editor, no user management",
  },
  {
    roleName: "Guest",
    roleLevel: 4,
    roleDesc: "Read-only access to dashboards and reports",
  },
];

// 🔹 Daftar User (1 per role) — tanpa userId/roleId di sini (akan digenerate saat seeding)
const users = [
  {
    username: "fendip",
    name: "Fendy",
    badgeNumber: "2001-0362",
    password: "123456",
    roleName: "Admin", // ❗ roleName sebagai penanda, bukan roleId langsung (opsi bersih & scalable)
  },
  {
    username: "wingdip",
    name: "Surilawaty",
    badgeNumber: "30113",
    password: "admin123",
    roleName: "Admin",
  },
  {
    username: "lisdip",
    name: "Lisa",
    badgeNumber: "20289",
    password: "admin123",
    roleName: "Admin",
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // 🏷️ 1. Seed Roles dan simpan mapping roleName → roleId
  const roleMap: Record<string, string> = {};
  for (const role of roles) {
    const roleId = await generateRoleId();
    const created = await prisma.role.upsert({
      where: { roleId },
      update: {},
      create: {
        roleId,
        ...role,
      },
    });
    roleMap[role.roleName] = created.roleId; // simpan hubungan roleName → roleId
    console.log(`✅ Role: ${created.roleName} → ${created.roleId}`);
  }

  // 👤 2. Seed Users
  for (const user of users) {
    const userId = await generateUserId();
    const roleId = roleMap[user.roleName]; // ambil roleId dari mapping
    if (!roleId) {
      throw new Error(`Role not found for user ${user.username}: ${user.roleName}`);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10); // hash per-user (lebih aman & tidak perlu cache)

    const created = await prisma.user.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        username: user.username,
        name: user.name,
        badgeNumber: user.badgeNumber,
        password: hashedPassword,
        isActive: true,
        isDeleted: false,
        roleId,
      },
    });
    console.log(`✅ User: ${created.username} → ${created.roleId}`);
  }

  console.log("\n✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });