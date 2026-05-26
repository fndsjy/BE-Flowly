import { prismaFlowly as prisma } from "../src/application/database.js";
import {
  generatemasAccessId,
  generatePortalMenuMapId,
} from "../src/utils/id-generator.js";

const ADMINISTRATOR_PORTAL_KEY = "ADMINISTRATOR";
const PORTAL_ACCESS_MENU_KEY = "ADMINISTRATOR_PORTAL_ACCESS";
const AUDIT_LOG_MENU_KEY = "ADMINISTRATOR_AUDIT_LOG";
const ADMIN_USERS_MENU_KEY = "ADMIN_USERS";
const ADMIN_JABATAN_MENU_KEY = "ADMIN_JABATAN";
const EMPLOYEE_ACCESS_ROLE_MODULE_KEY = "ADMIN_ACCESS_ROLE";
const EMPLOYEE_NOTIFICATION_TEMPLATE_MODULE_KEY = "ADMIN_NOTIFICATION_TEMPLATE";
const OLD_EMPLOYEE_USERS_MODULE_KEY = "ADMIN_USERS";
const OLD_EMPLOYEE_JABATAN_MODULE_KEY = "ADMIN_JABATAN";
const OLD_EMPLOYEE_AUDIT_LOG_MODULE_KEY = "ADMIN_AUDIT_LOG";
const CUSTOMER_SIDEBAR_MENU_KEYS = [
  "CUSTOMER_DASHBOARD",
  "CUSTOMER_ONBOARDING",
  "CUSTOMER_ADMIN",
];
const CUSTOMER_SIDEBAR_MODULE_KEYS = [
  "CUSTOMER_ONBOARDING_CHECKLIST",
  "CUSTOMER_ONBOARDING_ASSESSMENTS",
  "CUSTOMER_ONBOARDING_CERTIFICATES",
  "CUSTOMER_ADMIN_CUSTOMERS",
];

const main = async () => {
  const makeMasterAccessId = await generatemasAccessId();
  const makePortalMenuMapId = await generatePortalMenuMapId();
  const now = new Date();

  const administratorPortal = await prisma.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "PORTAL",
        resourceKey: ADMINISTRATOR_PORTAL_KEY,
      },
    },
    select: { masAccessId: true },
  });

  if (!administratorPortal) {
    throw new Error("Portal ADMINISTRATOR belum ada di master_access_role.");
  }

  const upsertAdministratorMenu = async ({
    resourceKey,
    displayName,
    route,
  }: {
    resourceKey: string;
    displayName: string;
    route: string;
  }) => {
    return prisma.masterAccessRole.upsert({
      where: {
        resourceType_resourceKey: {
          resourceType: "MENU",
          resourceKey,
        },
      },
      update: {
        displayName,
        route,
        parentKey: null,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      create: {
        masAccessId: makeMasterAccessId(),
        resourceType: "MENU",
        resourceKey,
        displayName,
        route,
        parentKey: null,
        isActive: true,
        isDeleted: false,
      },
      select: { masAccessId: true },
    });
  };

  const upsertAdministratorMenuMap = async (
    menuMasAccessId: string,
    orderIndex: number
  ) => {
    await prisma.portalMenuMap.upsert({
      where: {
        portalMasAccessId_menuMasAccessId: {
          portalMasAccessId: administratorPortal.masAccessId,
          menuMasAccessId,
        },
      },
      update: {
        orderIndex,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      create: {
        portalMenuMapId: makePortalMenuMapId(),
        portalMasAccessId: administratorPortal.masAccessId,
        menuMasAccessId,
        orderIndex,
        isActive: true,
        isDeleted: false,
      },
    });
  };

  const portalAccessMenu = await upsertAdministratorMenu({
    resourceKey: PORTAL_ACCESS_MENU_KEY,
    displayName: "Akses Portal Admin",
    route: "/portal-administrator/portal-access",
  });

  const adminUsersMenu = await upsertAdministratorMenu({
    resourceKey: ADMIN_USERS_MENU_KEY,
    displayName: "Users",
    route: "/portal-administrator/users",
  });

  const adminJabatanMenu = await upsertAdministratorMenu({
    resourceKey: ADMIN_JABATAN_MENU_KEY,
    displayName: "Jabatan",
    route: "/portal-administrator/jabatan",
  });

  await upsertAdministratorMenuMap(adminUsersMenu.masAccessId, 50);
  await upsertAdministratorMenuMap(adminJabatanMenu.masAccessId, 60);
  await upsertAdministratorMenuMap(portalAccessMenu.masAccessId, 80);

  const notificationTemplateMenu = await prisma.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "MENU",
        resourceKey: "ADMINISTRATOR_NOTIF_TEMPLATE",
      },
    },
    select: { masAccessId: true },
  });

  if (notificationTemplateMenu) {
    await upsertAdministratorMenuMap(notificationTemplateMenu.masAccessId, 70);
  }

  const auditLogMenu = await prisma.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "MENU",
        resourceKey: AUDIT_LOG_MENU_KEY,
      },
    },
    select: { masAccessId: true },
  });

  if (auditLogMenu) {
    await upsertAdministratorMenuMap(auditLogMenu.masAccessId, 90);
  }

  await prisma.masterAccessRole.updateMany({
    where: {
      resourceType: "MODULE",
      resourceKey: EMPLOYEE_ACCESS_ROLE_MODULE_KEY,
    },
    data: {
      displayName: "Hak Akses Organisasi",
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
  });

  await prisma.masterAccessRole.updateMany({
    where: {
      resourceType: "MODULE",
      resourceKey: EMPLOYEE_NOTIFICATION_TEMPLATE_MODULE_KEY,
    },
    data: {
      displayName: "Template Notif A3",
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
  });

  await prisma.masterAccessRole.updateMany({
    where: {
      resourceType: "MODULE",
      resourceKey: { in: [OLD_EMPLOYEE_USERS_MODULE_KEY, OLD_EMPLOYEE_JABATAN_MODULE_KEY] },
    },
    data: {
      isActive: false,
      isDeleted: true,
      deletedAt: now,
      deletedBy: "seed",
    },
  });

  await prisma.masterAccessRole.updateMany({
    where: {
      resourceType: "MODULE",
      resourceKey: OLD_EMPLOYEE_AUDIT_LOG_MODULE_KEY,
    },
    data: {
      isActive: false,
      isDeleted: true,
      deletedAt: now,
      deletedBy: "seed",
    },
  });

  const customerMenuRows = await prisma.masterAccessRole.findMany({
    where: {
      resourceType: "MENU",
      resourceKey: { in: CUSTOMER_SIDEBAR_MENU_KEYS },
    },
    select: { masAccessId: true },
  });
  const customerMenuIds = customerMenuRows.map((item) => item.masAccessId);

  await prisma.masterAccessRole.updateMany({
    where: {
      OR: [
        { resourceType: "MENU", resourceKey: { in: CUSTOMER_SIDEBAR_MENU_KEYS } },
        { resourceType: "MODULE", resourceKey: { in: CUSTOMER_SIDEBAR_MODULE_KEYS } },
      ],
    },
    data: {
      isActive: false,
      isDeleted: true,
      deletedAt: now,
      deletedBy: "seed",
    },
  });

  if (customerMenuIds.length > 0) {
    await prisma.portalMenuMap.updateMany({
      where: {
        menuMasAccessId: { in: customerMenuIds },
        isDeleted: false,
      },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: now,
        deletedBy: "seed",
      },
    });
  }

  console.log("Seed admin portal access selesai.");
};

main()
  .catch((error) => {
    console.error("Seed admin portal access gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
