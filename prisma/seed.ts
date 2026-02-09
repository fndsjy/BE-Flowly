// prisma/seed.ts
import { prismaFlowly as prisma } from "../src/application/database.js";
import bcrypt from "bcrypt";
import {
  generateUserId,
  generateRoleId,
  generatemasAccessId,
  generateAcessRoleId,
  generateFishboneCategoryId
} from "../src/utils/id-generator.js";

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

const masAccessItems = [
  { resourceType: "MENU", resourceKey: "ORGANISASI", displayName: "Organisasi", route: "/pilar", parentKey: null, orderIndex: 10 },
  { resourceType: "MENU", resourceKey: "PROSEDUR", displayName: "Prosedur", route: "/prosedur", parentKey: null, orderIndex: 20 },
  { resourceType: "MENU", resourceKey: "A3", displayName: "A3", route: "/a3", parentKey: null, orderIndex: 30 },
  { resourceType: "MENU", resourceKey: "ABSENSI", displayName: "Absensi", route: "/absensi", parentKey: null, orderIndex: 40 },
  { resourceType: "MENU", resourceKey: "ADMIN", displayName: "Administrator", route: "/administrator", parentKey: null, orderIndex: 50 },
  { resourceType: "MODULE", resourceKey: "PILAR", displayName: "Pilar", route: "/pilar", parentKey: "ORGANISASI", orderIndex: 10 },
  { resourceType: "MODULE", resourceKey: "SBU", displayName: "SBU", route: "/pilar/sbu", parentKey: "ORGANISASI", orderIndex: 20 },
  { resourceType: "MODULE", resourceKey: "SBU_SUB", displayName: "SBU Sub", route: "/pilar/sbu/sbu_sub", parentKey: "ORGANISASI", orderIndex: 30 },
  { resourceType: "MODULE", resourceKey: "CHART", displayName: "Chart", route: "/pilar/sbu/sbu_sub/organisasi", parentKey: "ORGANISASI", orderIndex: 40 },
  { resourceType: "MODULE", resourceKey: "CHART_MEMBER", displayName: "Chart Member", route: null, parentKey: "ORGANISASI", orderIndex: 50 },
  { resourceType: "MODULE", resourceKey: "ADMIN_USERS", displayName: "Users", route: "/administrator/users", parentKey: "ADMIN", orderIndex: 10 },
  { resourceType: "MODULE", resourceKey: "ADMIN_JABATAN", displayName: "Jabatan", route: "/administrator/jabatan", parentKey: "ADMIN", orderIndex: 20 },
  { resourceType: "MODULE", resourceKey: "ADMIN_ACCESS_ROLE", displayName: "Hak Akses", route: "/administrator/access-role", parentKey: "ADMIN", orderIndex: 30 },
  { resourceType: "MODULE", resourceKey: "ADMIN_AUDIT_LOG", displayName: "Audit Log", route: "/administrator/audit-log", parentKey: "ADMIN", orderIndex: 40 },
];

type accessRoleseed = {
  subjectType: "ROLE" | "USER";
  subjectId: string;
  resourceType: string;
  masAccessId?: string | null;
  resourceKey?: string | null;
  accessLevel: string;
};

const accessRoles: accessRoleseed[] = [
  {
    subjectType: "ROLE",
    subjectId: "ROL111225-0001",
    resourceType: "MENU",
    resourceKey: "ADMIN",
    accessLevel: "FULL",
  },
  {
    subjectType: "USER",
    subjectId: "USR111225-0001",
    resourceType: "MENU",
    resourceKey: "ABSENSI",
    accessLevel: "READ",
  },
];

const fishboneCategories = [
  { categoryCode: "MAN", categoryName: "Man (Manusia)" },
  { categoryCode: "MATERIAL", categoryName: "Material (Materi)" },
  { categoryCode: "MACHINE", categoryName: "Machine (Mesin)" },
  { categoryCode: "METHOD", categoryName: "Method (Metode)" },
  { categoryCode: "MANAGEMENT", categoryName: "Management (Manajemen)" },
  { categoryCode: "ENVIRONMENT", categoryName: "Environment (Lingkungan)" },
];

async function main() {
  console.log("Starting seed...");

  const existingRoles = await prisma.role.count();
  const existingUsers = await prisma.user.count();
  const shouldSeedUsersRoles =
    process.env.SEED_USERS_ROLES === "true" || (existingRoles === 0 && existingUsers === 0);

  if (shouldSeedUsersRoles) {
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
      roleMap[role.roleName] = created.roleId;
      console.log(`Role: ${created.roleName} -> ${created.roleId}`);
    }

    for (const user of users) {
      const userId = await generateUserId();
      const roleId = roleMap[user.roleName];
      if (!roleId) {
        throw new Error(`Role not found for user ${user.username}: ${user.roleName}`);
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

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
      console.log(`User: ${created.username} -> ${created.roleId}`);
    }
  } else {
    console.log("Skipping role/user seeding because data already exists.");
  }

  const makemasAccessId = await generatemasAccessId();
  for (const item of masAccessItems) {
    await prisma.masterAccessRole.upsert({
      where: {
        resourceType_resourceKey: {
          resourceType: item.resourceType,
          resourceKey: item.resourceKey,
        },
      },
      update: {
        displayName: item.displayName,
        route: item.route,
        parentKey: item.parentKey,
        orderIndex: item.orderIndex,
        isActive: true,
        isDeleted: false,
      },
      create: {
        masAccessId: makemasAccessId(),
        resourceType: item.resourceType,
        resourceKey: item.resourceKey,
        displayName: item.displayName,
        route: item.route,
        parentKey: item.parentKey,
        orderIndex: item.orderIndex,
        isActive: true,
        isDeleted: false,
      },
    });
  }

  for (const role of accessRoles) {
    const existing = await prisma.accessRole.findFirst({
      where: {
        subjectType: role.subjectType,
        subjectId: role.subjectId,
        resourceType: role.resourceType,
        masAccessId: role.masAccessId ?? null,
        resourceKey: role.resourceKey ?? null,
      },
      select: { accessId: true },
    });

    if (existing?.accessId) {
      await prisma.accessRole.update({
        where: { accessId: existing.accessId },
        data: {
          accessLevel: role.accessLevel,
          isActive: true,
          isDeleted: false,
        },
      });
      continue;
    }

    const accessId = await generateAcessRoleId();
    await prisma.accessRole.create({
      data: {
        accessId,
        subjectType: role.subjectType,
        subjectId: role.subjectId,
        resourceType: role.resourceType,
        masAccessId: role.masAccessId ?? null,
        resourceKey: role.resourceKey ?? null,
        accessLevel: role.accessLevel,
        isActive: true,
        isDeleted: false,
      },
    });
  }

  for (const category of fishboneCategories) {
    const existing = await prisma.fishboneCategory.findUnique({
      where: { categoryCode: category.categoryCode },
      select: { fishboneCategoryId: true },
    });

    if (existing?.fishboneCategoryId) {
      await prisma.fishboneCategory.update({
        where: { fishboneCategoryId: existing.fishboneCategoryId },
        data: {
          categoryName: category.categoryName,
          categoryDesc: null,
          isActive: true,
          isDeleted: false,
        },
      });
      continue;
    }

    const fishboneCategoryId = await generateFishboneCategoryId();
    await prisma.fishboneCategory.create({
      data: {
        fishboneCategoryId,
        categoryCode: category.categoryCode,
        categoryName: category.categoryName,
        categoryDesc: null,
        isActive: true,
        isDeleted: false,
      },
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
