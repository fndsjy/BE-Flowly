// prisma/seed.ts
import { prismaFlowly as prisma } from "../src/application/database.js";
import bcrypt from "bcrypt";
import {
  generateUserId,
  generateRoleId,
  generatemasAccessId,
  generateAcessRoleId,
  generateFishboneCategoryId,
  generatePortalMenuMapId,
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
  { resourceType: "PORTAL", resourceKey: "EMPLOYEE", displayName: "Employee", route: "/employee", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "SUPPLIER", displayName: "Supplier", route: "/supplier", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "CUSTOMER", displayName: "Customer", route: "/customer", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "AFFILIATE", displayName: "Affiliate", route: "/affiliate", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "INFLUENCER", displayName: "Influencer", route: "/influencer", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "COMMUNITY", displayName: "Community", route: "/community", parentKey: null },
  { resourceType: "PORTAL", resourceKey: "ADMINISTRATOR", displayName: "Administrator", route: "/portal-administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "EMPLOYEE_DASHBOARD", displayName: "Dashboard", route: "/employee", parentKey: null },
  { resourceType: "MENU", resourceKey: "EMPLOYEE_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "ORGANISASI", displayName: "Organisasi", route: "/pilar", parentKey: null },
  { resourceType: "MENU", resourceKey: "PROSEDUR", displayName: "Prosedur", route: "/prosedur", parentKey: null },
  { resourceType: "MENU", resourceKey: "A3", displayName: "A3", route: "/a3", parentKey: null },
  { resourceType: "MENU", resourceKey: "ABSENSI", displayName: "Absensi", route: "/absensi", parentKey: null },
  { resourceType: "MENU", resourceKey: "HRD", displayName: "HRD", route: "/hrd", parentKey: null },
  { resourceType: "MENU", resourceKey: "ADMIN", displayName: "Administrator", route: "/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "ONBOARDING", displayName: "Onboarding", route: "/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "SUPPLIER_DASHBOARD", displayName: "Dashboard", route: "/supplier", parentKey: null },
  { resourceType: "MENU", resourceKey: "SUPPLIER_ONBOARDING", displayName: "Onboarding", route: "/supplier/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "SUPPLIER_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "SUPPLIER_ADMIN", displayName: "Administrator", route: "/supplier/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "CUSTOMER_DASHBOARD", displayName: "Dashboard", route: "/customer", parentKey: null },
  { resourceType: "MENU", resourceKey: "CUSTOMER_ONBOARDING", displayName: "Onboarding", route: "/customer/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "CUSTOMER_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "CUSTOMER_ADMIN", displayName: "Administrator", route: "/customer/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "AFFILIATE_DASHBOARD", displayName: "Dashboard", route: "/affiliate", parentKey: null },
  { resourceType: "MENU", resourceKey: "AFFILIATE_ONBOARDING", displayName: "Onboarding", route: "/affiliate/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "AFFILIATE_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "AFFILIATE_ADMIN", displayName: "Administrator", route: "/affiliate/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "INFLUENCER_DASHBOARD", displayName: "Dashboard", route: "/influencer", parentKey: null },
  { resourceType: "MENU", resourceKey: "INFLUENCER_ONBOARDING", displayName: "Onboarding", route: "/influencer/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "INFLUENCER_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "INFLUENCER_ADMIN", displayName: "Administrator", route: "/influencer/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "COMMUNITY_DASHBOARD", displayName: "Dashboard", route: "/community", parentKey: null },
  { resourceType: "MENU", resourceKey: "COMMUNITY_ONBOARDING", displayName: "Onboarding", route: "/community/onboarding", parentKey: null },
  { resourceType: "MENU", resourceKey: "COMMUNITY_LEARNING", displayName: "Learning", route: "https://lms.domas.co.id/", parentKey: null },
  { resourceType: "MENU", resourceKey: "COMMUNITY_ADMIN", displayName: "Administrator", route: "/community/administrator", parentKey: null },
  { resourceType: "MENU", resourceKey: "ADMINISTRATOR_ONBOARDING", displayName: "Onboarding", route: "/portal-administrator/onboarding", parentKey: null },
  { resourceType: "MODULE", resourceKey: "PILAR", displayName: "Pilar", route: "/pilar", parentKey: "ORGANISASI" },
  { resourceType: "MODULE", resourceKey: "SBU", displayName: "SBU", route: "/pilar/sbu", parentKey: "ORGANISASI" },
  { resourceType: "MODULE", resourceKey: "SBU_SUB", displayName: "SBU Sub", route: "/pilar/sbu/sbu_sub", parentKey: "ORGANISASI" },
  { resourceType: "MODULE", resourceKey: "CHART", displayName: "Chart", route: "/pilar/sbu/sbu_sub/organisasi", parentKey: "ORGANISASI" },
  { resourceType: "MODULE", resourceKey: "CHART_MEMBER", displayName: "Chart Member", route: null, parentKey: "ORGANISASI" },
  { resourceType: "MODULE", resourceKey: "CASE", displayName: "Case", route: "/a3/case", parentKey: "A3" },
  { resourceType: "MODULE", resourceKey: "ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/onboarding/checklist", parentKey: "ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/onboarding/assessments", parentKey: "ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/onboarding/certificates", parentKey: "ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "ADMIN_USERS", displayName: "Users", route: "/administrator/users", parentKey: "ADMIN" },
  { resourceType: "MODULE", resourceKey: "ADMIN_JABATAN", displayName: "Jabatan", route: "/administrator/jabatan", parentKey: "ADMIN" },
  { resourceType: "MODULE", resourceKey: "ADMIN_ACCESS_ROLE", displayName: "Hak Akses", route: "/administrator/access-role", parentKey: "ADMIN" },
  { resourceType: "MODULE", resourceKey: "ADMIN_AUDIT_LOG", displayName: "Audit Log", route: "/administrator/audit-log", parentKey: "ADMIN" },
  { resourceType: "MODULE", resourceKey: "ADMIN_NOTIFICATION_TEMPLATE", displayName: "Template Notifikasi", route: "/administrator/notification-template", parentKey: "ADMIN" },
  { resourceType: "MODULE", resourceKey: "SUPPLIER_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/supplier/onboarding/checklist", parentKey: "SUPPLIER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "SUPPLIER_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/supplier/onboarding/assessments", parentKey: "SUPPLIER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "SUPPLIER_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/supplier/onboarding/certificates", parentKey: "SUPPLIER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "SUPPLIER_ADMIN_SUPPLIERS", displayName: "Supplier", route: "/supplier/administrator/suppliers", parentKey: "SUPPLIER_ADMIN" },
  { resourceType: "MODULE", resourceKey: "CUSTOMER_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/customer/onboarding/checklist", parentKey: "CUSTOMER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "CUSTOMER_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/customer/onboarding/assessments", parentKey: "CUSTOMER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "CUSTOMER_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/customer/onboarding/certificates", parentKey: "CUSTOMER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "CUSTOMER_ADMIN_CUSTOMERS", displayName: "Customers", route: "/customer/administrator/customers", parentKey: "CUSTOMER_ADMIN" },
  { resourceType: "MODULE", resourceKey: "AFFILIATE_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/affiliate/onboarding/checklist", parentKey: "AFFILIATE_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "AFFILIATE_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/affiliate/onboarding/assessments", parentKey: "AFFILIATE_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "AFFILIATE_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/affiliate/onboarding/certificates", parentKey: "AFFILIATE_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "AFFILIATE_ADMIN_AFFILIATES", displayName: "Affiliate", route: "/affiliate/administrator/affiliates", parentKey: "AFFILIATE_ADMIN" },
  { resourceType: "MODULE", resourceKey: "INFLUENCER_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/influencer/onboarding/checklist", parentKey: "INFLUENCER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "INFLUENCER_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/influencer/onboarding/assessments", parentKey: "INFLUENCER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "INFLUENCER_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/influencer/onboarding/certificates", parentKey: "INFLUENCER_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "INFLUENCER_ADMIN_INFLUENCERS", displayName: "Influencer", route: "/influencer/administrator/influencers", parentKey: "INFLUENCER_ADMIN" },
  { resourceType: "MODULE", resourceKey: "COMMUNITY_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/community/onboarding/checklist", parentKey: "COMMUNITY_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "COMMUNITY_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/community/onboarding/assessments", parentKey: "COMMUNITY_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "COMMUNITY_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/community/onboarding/certificates", parentKey: "COMMUNITY_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "COMMUNITY_ADMIN_COMMUNITIES", displayName: "Community", route: "/community/administrator/communities", parentKey: "COMMUNITY_ADMIN" },
  { resourceType: "MODULE", resourceKey: "ADMINISTRATOR_ONBOARDING_CHECKLIST", displayName: "Onboarding Checklist", route: "/portal-administrator/onboarding/checklist", parentKey: "ADMINISTRATOR_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "ADMINISTRATOR_ONBOARDING_ASSESSMENTS", displayName: "Assessments", route: "/portal-administrator/onboarding/assessments", parentKey: "ADMINISTRATOR_ONBOARDING" },
  { resourceType: "MODULE", resourceKey: "ADMINISTRATOR_ONBOARDING_CERTIFICATES", displayName: "Certificates", route: "/portal-administrator/onboarding/certificates", parentKey: "ADMINISTRATOR_ONBOARDING" },
];

const portalMenuMappings = [
  { portalKey: "EMPLOYEE", menuKey: "EMPLOYEE_DASHBOARD", orderIndex: 10 },
  { portalKey: "EMPLOYEE", menuKey: "ORGANISASI", orderIndex: 20 },
  { portalKey: "EMPLOYEE", menuKey: "PROSEDUR", orderIndex: 30 },
  { portalKey: "EMPLOYEE", menuKey: "FISHBONE", orderIndex: 40 },
  { portalKey: "EMPLOYEE", menuKey: "A3", orderIndex: 50 },
  { portalKey: "EMPLOYEE", menuKey: "HRD", orderIndex: 60 },
  { portalKey: "EMPLOYEE", menuKey: "ABSENSI", orderIndex: 70 },
  { portalKey: "EMPLOYEE", menuKey: "ONBOARDING", orderIndex: 80 },
  { portalKey: "EMPLOYEE", menuKey: "EMPLOYEE_LEARNING", orderIndex: 90 },
  { portalKey: "EMPLOYEE", menuKey: "ADMIN", orderIndex: 100 },
  { portalKey: "SUPPLIER", menuKey: "SUPPLIER_DASHBOARD", orderIndex: 10 },
  { portalKey: "SUPPLIER", menuKey: "SUPPLIER_ONBOARDING", orderIndex: 20 },
  { portalKey: "SUPPLIER", menuKey: "SUPPLIER_LEARNING", orderIndex: 30 },
  { portalKey: "SUPPLIER", menuKey: "SUPPLIER_ADMIN", orderIndex: 40 },
  { portalKey: "CUSTOMER", menuKey: "CUSTOMER_DASHBOARD", orderIndex: 10 },
  { portalKey: "CUSTOMER", menuKey: "CUSTOMER_ONBOARDING", orderIndex: 20 },
  { portalKey: "CUSTOMER", menuKey: "CUSTOMER_LEARNING", orderIndex: 30 },
  { portalKey: "CUSTOMER", menuKey: "CUSTOMER_ADMIN", orderIndex: 40 },
  { portalKey: "AFFILIATE", menuKey: "AFFILIATE_DASHBOARD", orderIndex: 10 },
  { portalKey: "AFFILIATE", menuKey: "AFFILIATE_ONBOARDING", orderIndex: 20 },
  { portalKey: "AFFILIATE", menuKey: "AFFILIATE_LEARNING", orderIndex: 30 },
  { portalKey: "AFFILIATE", menuKey: "AFFILIATE_ADMIN", orderIndex: 40 },
  { portalKey: "INFLUENCER", menuKey: "INFLUENCER_DASHBOARD", orderIndex: 10 },
  { portalKey: "INFLUENCER", menuKey: "INFLUENCER_ONBOARDING", orderIndex: 20 },
  { portalKey: "INFLUENCER", menuKey: "INFLUENCER_LEARNING", orderIndex: 30 },
  { portalKey: "INFLUENCER", menuKey: "INFLUENCER_ADMIN", orderIndex: 40 },
  { portalKey: "COMMUNITY", menuKey: "COMMUNITY_DASHBOARD", orderIndex: 10 },
  { portalKey: "COMMUNITY", menuKey: "COMMUNITY_ONBOARDING", orderIndex: 20 },
  { portalKey: "COMMUNITY", menuKey: "COMMUNITY_LEARNING", orderIndex: 30 },
  { portalKey: "COMMUNITY", menuKey: "COMMUNITY_ADMIN", orderIndex: 40 },
  { portalKey: "ADMINISTRATOR", menuKey: "ADMINISTRATOR_ONBOARDING", orderIndex: 10 },
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
        isActive: true,
        isDeleted: false,
      },
    });
  }

  const resourceRows = await prisma.masterAccessRole.findMany({
    where: {
      isDeleted: false,
      resourceType: { in: ["PORTAL", "MENU"] },
    },
    select: {
      masAccessId: true,
      resourceType: true,
      resourceKey: true,
    },
  });

  const resourceMap = new Map(
    resourceRows.map((item) => [`${item.resourceType}:${item.resourceKey}`, item.masAccessId])
  );

  const makePortalMenuMapId = await generatePortalMenuMapId();
  for (const mapping of portalMenuMappings) {
    const portalMasAccessId = resourceMap.get(`PORTAL:${mapping.portalKey}`);
    const menuMasAccessId = resourceMap.get(`MENU:${mapping.menuKey}`);

    if (!portalMasAccessId || !menuMasAccessId) {
      throw new Error(
        `Portal/menu mapping resource missing for ${mapping.portalKey} -> ${mapping.menuKey}`
      );
    }

    await prisma.portalMenuMap.upsert({
      where: {
        portalMasAccessId_menuMasAccessId: {
          portalMasAccessId,
          menuMasAccessId,
        },
      },
      update: {
        orderIndex: mapping.orderIndex,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      create: {
        portalMenuMapId: makePortalMenuMapId(),
        portalMasAccessId,
        menuMasAccessId,
        orderIndex: mapping.orderIndex,
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
