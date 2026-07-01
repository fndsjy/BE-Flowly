import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { invalidateProfileCache } from "../application/profile-cache.js";
import type { Prisma } from "../generated/flowly/client.js";
import { generateNotificationOutboxId } from "../utils/id-generator.js";

const EMPLOYEE_PARTICIPANT_REFERENCE_TYPE = "EMPLOYEE";
const FINISHED_FLAG = "Y";
const RELEASED_FLAG = 1;
const DEFAULT_PASS_SCORE = 60;
const SYNC_ACTOR = "SYSTEM";
const DEFAULT_PORTAL_KEY = "EMPLOYEE";
const PARTICIPANT_RECIPIENT_ROLE = "PARTICIPANT";
const HRD_RECIPIENT_ROLE = "HRD";
const SBU_SUB_PIC_RECIPIENT_ROLE = "SBU_SUB_PIC";
const ONBOARDING_PASSED_EVENT_KEY = "ONBOARDING_PASSED";
const ONBOARDING_ASSIGNMENT_CONTEXT_TYPE = "ONBOARDING_ASSIGNMENT";
const CHANNEL_WHATSAPP = "WHATSAPP";
const CHANNEL_EMAIL = "EMAIL";

type SyncReleasedResultsOptions = {
  participantReferenceIds?: string[];
  portalKeys?: string[];
  examSessionIds?: string[];
};

type RuntimeNotificationTemplate = {
  notificationTemplateId: string;
  channel: typeof CHANNEL_WHATSAPP | typeof CHANNEL_EMAIL;
  eventKey: string;
  recipientRole: string;
  messageTemplate: string;
  portalMappings: Array<{
    portalKey: string;
  }>;
};

type NotificationTemplateForOutbox = {
  notificationTemplateId: string | null;
  channel: typeof CHANNEL_WHATSAPP | typeof CHANNEL_EMAIL;
  messageTemplate: string;
};

type EmployeeLookup = {
  UserId: number;
  CardNo: string | null;
  BadgeNum?: string | null;
  Name: string | null;
  Phone: string | null;
  email: string | null;
};

type SbuSubPicOnboardingRecipient = {
  employeeUserId: number;
  recipientUserId: number;
  recipientName: string;
  phoneNumber: string | null;
  email: string | null;
  sbuSubId: number;
  sbuSubName: string;
  sbuName: string | null;
  pilarName: string | null;
  positionNames: string[];
  jabatanNames: string[];
};

type HrdNotificationRecipient = {
  userId: number;
  recipientName: string;
  phoneNumber: string | null;
  email: string | null;
};

const normalizeUpper = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const normalizeNote = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

const normalizePortalKey = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed.toUpperCase()
    : DEFAULT_PORTAL_KEY;
};

const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = value.replace(/\D+/g, "");
  return digits.length > 0 ? digits : null;
};

const normalizeEmail = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "-" ? trimmed : null;
};

const normalizeScore = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value ?? "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const uniqueTexts = (values?: string[]) =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );

const isAssignmentBlockedFromSync = (status?: string | null) => {
  const normalized = normalizeUpper(status);
  return (
    normalized === "CANCELLED" ||
    normalized === "TRANSFER_REVIEW" ||
    normalized === "FAILED" ||
    normalized === "FAIL_FINAL"
  );
};

const isStagePassedForSync = (status?: string | null) => {
  const normalized = normalizeUpper(status);
  return normalized === "PASSED" || normalized === "COMPLETED";
};

const resolveOpenAssignmentStatus = (stageStatus?: string | null) => {
  const normalized = normalizeUpper(stageStatus);
  if (normalized === "WAITING_ADMIN" || normalized === "REMEDIAL") {
    return normalized;
  }

  return "IN_PROGRESS";
};

const activateEmployeeLmsAccess = async (params: {
  onboardingAssignmentId: string;
  participantReferenceId: string | null;
  updatedAt: Date;
}) => {
  const employeeUserId = Number(params.participantReferenceId);
  if (!Number.isInteger(employeeUserId) || employeeUserId <= 0) {
    logger.warn("Skipping LMS activation for invalid onboarding participant", {
      onboardingAssignmentId: params.onboardingAssignmentId,
      participantReferenceId: params.participantReferenceId,
    });
    return;
  }

  const updateResult = await prismaEmployee.em_employee.updateMany({
    where: {
      UserId: employeeUserId,
      statusLMS: {
        not: true,
      },
    },
    data: {
      statusLMS: true,
      Lastupdate: params.updatedAt,
    },
  });

  if (updateResult.count === 0) {
    const employee = await prismaEmployee.em_employee.findUnique({
      where: {
        UserId: employeeUserId,
      },
      select: {
        UserId: true,
      },
    });

    if (!employee) {
      logger.warn("Passed onboarding employee was not found for LMS activation", {
        onboardingAssignmentId: params.onboardingAssignmentId,
        employeeUserId,
      });
    }
  }
};

const renderTemplate = (template: string, context: Record<string, unknown>) =>
  template
    .replace(/\{badgeNumber\}/g, String(context.cardNumber ?? ""))
    .replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = context[key];
      if (value === undefined || value === null) {
        return "";
      }

      return String(value);
    });

const trimMessage = (value: string) => value.trim().slice(0, 1000);

const formatIndonesianDate = (value: Date) =>
  value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatOptionalDueDate = (value?: Date | null) =>
  value ? formatIndonesianDate(value) : "Tanpa batas waktu";

const formatIndonesianDateTime = (value: Date) =>
  value.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const resolveOmsLoginUrl = () => {
  const directUrl = normalizeNote(process.env.OMS_LOGIN_URL);
  if (directUrl) {
    return directUrl;
  }

  const baseUrl = normalizeNote(process.env.OMS_APP_BASE_URL);
  if (baseUrl) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    return /\/oms$/i.test(normalizedBaseUrl)
      ? `${normalizedBaseUrl}/login`
      : `${normalizedBaseUrl}/oms/login`;
  }

  return "http://localhost:5173/oms/login";
};

const resolveHrdDecisionUrl = () => {
  const loginUrl = resolveOmsLoginUrl();
  if (/\/login$/i.test(loginUrl)) {
    return loginUrl.replace(/\/login$/i, "/employee");
  }

  return `${loginUrl.replace(/\/+$/, "")}/employee`;
};

const resolveSupportName = () => normalizeNote(process.env.OMS_SUPPORT_NAME) ?? "";
const resolveSupportPhone = () => normalizeNote(process.env.OMS_SUPPORT_PHONE) ?? "";

const fallbackPassedNotificationTemplates: Record<
  string,
  NotificationTemplateForOutbox[]
> = {
  [PARTICIPANT_RECIPIENT_ROLE]: [
    {
      notificationTemplateId: null,
      channel: CHANNEL_WHATSAPP,
      messageTemplate:
        "Halo {recipientName},\n\nSelamat, onboarding Anda untuk {portalName} sudah lulus pada {decisionAt}.\nCatatan: {decisionNote}\n\nSilakan lanjutkan aktivitas Learning melalui {loginUrl}.",
    },
  ],
  [HRD_RECIPIENT_ROLE]: [
    {
      notificationTemplateId: null,
      channel: CHANNEL_WHATSAPP,
      messageTemplate:
        "Notifikasi onboarding lulus\n\n{employeeName} ({cardNumber}) sudah lulus onboarding {portalName} pada {decisionAt}.\nNilai akhir: {score}\nCatatan: {decisionNote}\n\nDetail: {decisionUrl}",
    },
  ],
  [SBU_SUB_PIC_RECIPIENT_ROLE]: [
    {
      notificationTemplateId: null,
      channel: CHANNEL_WHATSAPP,
      messageTemplate:
        "Halo {recipientName},\n\n{employeeName} ({cardNumber}) sudah lulus onboarding {portalName} pada {decisionAt}.\nNilai akhir: {score}\n\nStruktur:\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nJabatan: {jabatanName}\n\nPantau detail melalui {hrdUrl}.",
    },
  ],
};

const normalizePassedNotificationMessage = (
  recipientRole: string,
  messageTemplate: string
) => {
  if (normalizeUpper(recipientRole) !== PARTICIPANT_RECIPIENT_ROLE) {
    return messageTemplate;
  }

  return messageTemplate
    .replace("telah diluluskan oleh HRD", "sudah lulus")
    .replace(/Catatan HRD/g, "Catatan");
};

const toNotificationTemplates = (
  templates: RuntimeNotificationTemplate[],
  recipientRole: string
): NotificationTemplateForOutbox[] => {
  const selected = templates.map((template) => ({
    notificationTemplateId: template.notificationTemplateId,
    channel: template.channel,
    messageTemplate: normalizePassedNotificationMessage(
      recipientRole,
      template.messageTemplate
    ),
  }));

  return selected.length > 0
    ? selected
    : fallbackPassedNotificationTemplates[recipientRole] ?? [];
};

const resolveRuntimeNotificationTemplates = async (params: {
  portalKey: string;
  eventKey: string;
  recipientRole: string;
}) => {
  const portalKey = normalizePortalKey(params.portalKey);
  const eventKey = normalizeUpper(params.eventKey);
  const recipientRole = normalizeUpper(params.recipientRole);

  const items = await prismaFlowly.notificationTemplate.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      eventKey,
      recipientRole,
      OR: [
        {
          portalMappings: {
            some: {
              portalKey,
              isDeleted: false,
              isActive: true,
            },
          },
        },
        {
          portalMappings: {
            none: {
              isDeleted: false,
            },
          },
        },
      ],
    },
    include: {
      portalMappings: {
        where: {
          isDeleted: false,
          isActive: true,
        },
        select: {
          portalKey: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const selectedByChannel = new Map<
    string,
    RuntimeNotificationTemplate & { isPortalSpecific: boolean }
  >();

  for (const item of items) {
    const channel = normalizeUpper(item.channel);
    if (channel !== CHANNEL_WHATSAPP && channel !== CHANNEL_EMAIL) {
      continue;
    }

    const isPortalSpecific = item.portalMappings.some(
      (mapping) => normalizeUpper(mapping.portalKey) === portalKey
    );
    const existing = selectedByChannel.get(channel);

    if (!existing || (isPortalSpecific && !existing.isPortalSpecific)) {
      selectedByChannel.set(channel, {
        notificationTemplateId: item.notificationTemplateId,
        channel,
        eventKey: item.eventKey,
        recipientRole: item.recipientRole,
        messageTemplate: item.messageTemplate,
        portalMappings: item.portalMappings,
        isPortalSpecific,
      });
    }
  }

  return Array.from(selectedByChannel.values()).map(
    ({ isPortalSpecific: _isPortalSpecific, ...template }) => template
  );
};

const parseConfiguredHrdNotificationUserIds = () =>
  Array.from(
    new Set(
      [
        process.env.ONBOARDING_HRD_NOTIFY_USER_IDS,
        process.env.ONBOARDING_HRD_NOTIFY_USER_ID,
        process.env.ONBOARDING_EXAM_MONITOR_USER_IDS,
        process.env.ONBOARDING_EXAM_MONITOR_USER_ID,
      ]
        .flatMap((value) => (value ?? "").split(","))
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );

const resolveHrdNotificationRecipients = async (): Promise<
  HrdNotificationRecipient[]
> => {
  const configuredUserIds = parseConfiguredHrdNotificationUserIds();
  const configuredEmployeeIds = configuredUserIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const hrdMaster = await prismaFlowly.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "MENU",
        resourceKey: "HRD",
      },
    },
    select: {
      masAccessId: true,
    },
  });

  const accessRoles =
    configuredUserIds.length === 0
      ? await prismaFlowly.accessRole.findMany({
          where: {
            isDeleted: false,
            isActive: true,
            resourceType: "MENU",
            ...(hrdMaster
              ? {
                  OR: [
                    { resourceKey: "HRD" },
                    { masAccessId: hrdMaster.masAccessId },
                  ],
                }
              : { resourceKey: "HRD" }),
          },
          select: {
            subjectType: true,
            subjectId: true,
          },
        })
      : [];

  const hrdRoleIds = Array.from(
    new Set(
      accessRoles
        .filter((access) => normalizeUpper(access.subjectType) === "ROLE")
        .map((access) => access.subjectId)
    )
  );
  const hrdUserIds = Array.from(
    new Set(
      accessRoles
        .filter((access) => normalizeUpper(access.subjectType) === "USER")
        .map((access) => access.subjectId)
    )
  );

  const flowlyUsers =
    configuredUserIds.length > 0
      ? await prismaFlowly.user.findMany({
          where: {
            userId: { in: configuredUserIds },
            isActive: true,
            isDeleted: false,
          },
          select: {
            userId: true,
            name: true,
          },
        })
      : await prismaFlowly.user.findMany({
          where: {
            isActive: true,
            isDeleted: false,
            OR: [
              {
                role: {
                  roleLevel: 1,
                },
              },
              ...(hrdRoleIds.length > 0 ? [{ roleId: { in: hrdRoleIds } }] : []),
              ...(hrdUserIds.length > 0 ? [{ userId: { in: hrdUserIds } }] : []),
            ],
          },
          select: {
            userId: true,
            name: true,
          },
        });

  const flowlyNumericUserIds = flowlyUsers
    .map((user) => Number(user.userId))
    .filter((value) => Number.isInteger(value) && value > 0);
  const employeeIds = Array.from(
    new Set([...configuredEmployeeIds, ...flowlyNumericUserIds])
  );

  const employees =
    employeeIds.length > 0
      ? await prismaEmployee.em_employee.findMany({
          where: {
            UserId: { in: employeeIds },
          },
          select: {
            UserId: true,
            CardNo: true,
            BadgeNum: true,
            Name: true,
            Phone: true,
            email: true,
          },
        })
      : [];

  const employeeByUserId = new Map(
    employees.map((employee) => [employee.UserId, employee] as const)
  );
  const recipientMap = new Map<number, HrdNotificationRecipient>();

  for (const employeeId of configuredEmployeeIds) {
    const employee = employeeByUserId.get(employeeId);
    if (employee) {
      recipientMap.set(employee.UserId, {
        userId: employee.UserId,
        recipientName: normalizeNote(employee.Name) ?? `HRD ${employee.UserId}`,
        phoneNumber: normalizePhone(employee.Phone),
        email: normalizeEmail(employee.email),
      });
    }
  }

  for (const user of flowlyUsers) {
    const numericUserId = Number(user.userId);
    const employee =
      Number.isInteger(numericUserId) && numericUserId > 0
        ? employeeByUserId.get(numericUserId)
        : null;

    if (!employee) {
      continue;
    }

    recipientMap.set(employee.UserId, {
      userId: employee.UserId,
      recipientName:
        normalizeNote(employee.Name) ?? normalizeNote(user.name) ?? `HRD ${employee.UserId}`,
      phoneNumber: normalizePhone(employee.Phone),
      email: normalizeEmail(employee.email),
    });
  }

  return Array.from(recipientMap.values());
};

const resolveSbuSubPicOnboardingRecipients = async (
  userIds: number[]
): Promise<SbuSubPicOnboardingRecipient[]> => {
  const normalizedUserIds = Array.from(
    new Set(
      userIds.filter((userId) => Number.isInteger(userId) && userId > 0)
    )
  );

  if (normalizedUserIds.length === 0) {
    return [];
  }

  const chartMembers = await prismaFlowly.chartMember.findMany({
    where: {
      userId: { in: normalizedUserIds },
      isDeleted: false,
      node: { isDeleted: false },
    },
    orderBy: [{ chartId: "asc" }, { memberChartId: "asc" }],
    select: {
      userId: true,
      jabatan: true,
      node: {
        select: {
          chartId: true,
          position: true,
          pilarId: true,
          sbuId: true,
          sbuSubId: true,
        },
      },
    },
  });

  if (chartMembers.length === 0) {
    return [];
  }

  const sbuSubIds = Array.from(
    new Set(
      chartMembers
        .map((member) => member.node.sbuSubId)
        .filter((value): value is number => Number.isInteger(value) && value > 0)
    )
  );

  const sbuSubs =
    sbuSubIds.length > 0
      ? await prismaEmployee.em_sbu_sub.findMany({
          where: {
            id: { in: sbuSubIds },
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
          },
          select: {
            id: true,
            sbu_sub_name: true,
            sbu_id: true,
            sbu_pilar: true,
            pic: true,
          },
        })
      : [];

  const sbuSubById = new Map(sbuSubs.map((item) => [item.id, item]));
  const picUserIds = Array.from(
    new Set(
      sbuSubs
        .map((item) => item.pic)
        .filter(
          (value): value is number =>
            value !== null && value !== undefined && Number.isInteger(value) && value > 0
        )
    )
  );

  if (picUserIds.length === 0) {
    return [];
  }

  const sbuIds = Array.from(
    new Set(
      [
        ...chartMembers.map((member) => member.node.sbuId),
        ...sbuSubs.map((item) => item.sbu_id),
      ].filter(
        (value): value is number =>
          value !== null && value !== undefined && Number.isInteger(value) && value > 0
      )
    )
  );
  const pilarIds = Array.from(
    new Set(
      [
        ...chartMembers.map((member) => member.node.pilarId),
        ...sbuSubs.map((item) => item.sbu_pilar),
      ].filter(
        (value): value is number =>
          value !== null && value !== undefined && Number.isInteger(value) && value > 0
      )
    )
  );

  const [picEmployees, sbus, pilars] = await Promise.all([
    prismaEmployee.em_employee.findMany({
      where: {
        UserId: { in: picUserIds },
      },
      select: {
        UserId: true,
        Name: true,
        Phone: true,
        email: true,
      },
    }),
    sbuIds.length > 0
      ? prismaEmployee.em_sbu.findMany({
          where: { id: { in: sbuIds } },
          select: { id: true, sbu_name: true },
        })
      : [],
    pilarIds.length > 0
      ? prismaEmployee.em_pilar.findMany({
          where: { id: { in: pilarIds } },
          select: { id: true, pilar_name: true },
        })
      : [],
  ]);

  const picEmployeeById = new Map(
    picEmployees.map((employee) => [employee.UserId, employee])
  );
  const sbuNameById = new Map(
    sbus.map((sbu) => [sbu.id, normalizeNote(sbu.sbu_name)])
  );
  const pilarNameById = new Map(
    pilars.map((pilar) => [pilar.id, normalizeNote(pilar.pilar_name)])
  );

  const recipientMap = new Map<
    string,
    SbuSubPicOnboardingRecipient & {
      positionNameSet: Set<string>;
      jabatanNameSet: Set<string>;
    }
  >();

  for (const member of chartMembers) {
    if (!member.userId) {
      continue;
    }

    const sbuSub = sbuSubById.get(member.node.sbuSubId);
    const recipientUserId = sbuSub?.pic;
    if (
      !sbuSub ||
      !recipientUserId ||
      recipientUserId === member.userId ||
      !Number.isInteger(recipientUserId)
    ) {
      continue;
    }

    const picEmployee = picEmployeeById.get(recipientUserId);
    if (!picEmployee) {
      continue;
    }

    const sbuId = sbuSub.sbu_id ?? member.node.sbuId;
    const pilarId = sbuSub.sbu_pilar ?? member.node.pilarId;
    const key = `${member.userId}|${recipientUserId}|${sbuSub.id}`;
    const existing = recipientMap.get(key);
    const positionName =
      normalizeNote(member.node.position) ?? `Chart ${member.node.chartId}`;
    const jabatanName = normalizeNote(member.jabatan);

    if (existing) {
      existing.positionNameSet.add(positionName);
      if (jabatanName) {
        existing.jabatanNameSet.add(jabatanName);
      }
      existing.positionNames = Array.from(existing.positionNameSet);
      existing.jabatanNames = Array.from(existing.jabatanNameSet);
      continue;
    }

    const positionNameSet = new Set([positionName]);
    const jabatanNameSet = new Set<string>();
    if (jabatanName) {
      jabatanNameSet.add(jabatanName);
    }

    recipientMap.set(key, {
      employeeUserId: member.userId,
      recipientUserId,
      recipientName:
        normalizeNote(picEmployee.Name) ?? `PIC SBU Sub ${recipientUserId}`,
      phoneNumber: normalizePhone(picEmployee.Phone),
      email: normalizeEmail(picEmployee.email),
      sbuSubId: sbuSub.id,
      sbuSubName: normalizeNote(sbuSub.sbu_sub_name) ?? `SBU Sub ${sbuSub.id}`,
      sbuName:
        sbuId !== null && sbuId !== undefined
          ? sbuNameById.get(sbuId) ?? null
          : null,
      pilarName:
        pilarId !== null && pilarId !== undefined
          ? pilarNameById.get(pilarId) ?? null
          : null,
      positionNames: Array.from(positionNameSet),
      jabatanNames: Array.from(jabatanNameSet),
      positionNameSet,
      jabatanNameSet,
    });
  }

  return Array.from(recipientMap.values())
    .map(({ positionNameSet: _positionNameSet, jabatanNameSet: _jabatanNameSet, ...item }) => item)
    .sort((left, right) => {
      if (left.employeeUserId !== right.employeeUserId) {
        return left.employeeUserId - right.employeeUserId;
      }
      return left.sbuSubName.localeCompare(right.sbuSubName);
    });
};

const buildParticipantPassedContext = (params: {
  employee: EmployeeLookup;
  portalKey: string;
  portalName: string;
  dueAt: Date | null;
  completedAt: Date;
  score: number;
  decisionNote: string;
}) => {
  const cardNumber =
    normalizeNote(params.employee.CardNo) ??
    normalizeNote(params.employee.BadgeNum) ??
    String(params.employee.UserId);
  const recipientName = normalizeNote(params.employee.Name) ?? cardNumber;

  return {
    recipientName,
    employeeName: recipientName,
    cardNumber,
    portalName: params.portalName,
    portalKey: params.portalKey,
    dueDate: formatOptionalDueDate(params.dueAt),
    decisionAt: formatIndonesianDateTime(params.completedAt),
    decisionNote: params.decisionNote,
    score: params.score,
    loginUrl: resolveOmsLoginUrl(),
    hrdUrl: resolveHrdDecisionUrl(),
    decisionUrl: resolveHrdDecisionUrl(),
    supportName: resolveSupportName(),
    supportPhone: resolveSupportPhone(),
  };
};

const buildSbuSubPicPassedContext = (params: {
  employee: EmployeeLookup;
  recipient: SbuSubPicOnboardingRecipient;
  portalKey: string;
  portalName: string;
  dueAt: Date | null;
  completedAt: Date;
  score: number;
  decisionNote: string;
}) => {
  const participantContext = buildParticipantPassedContext({
    employee: params.employee,
    portalKey: params.portalKey,
    portalName: params.portalName,
    dueAt: params.dueAt,
    completedAt: params.completedAt,
    score: params.score,
    decisionNote: params.decisionNote,
  });

  return {
    ...participantContext,
    recipientName: params.recipient.recipientName,
    sbuSubName: params.recipient.sbuSubName,
    sbuName: params.recipient.sbuName ?? "",
    pilarName: params.recipient.pilarName ?? "",
    positionName: params.recipient.positionNames.join(", "),
    jabatanName: params.recipient.jabatanNames.join(", "),
  };
};

const enqueueOnboardingPassedNotifications = async (params: {
  onboardingAssignmentId: string;
  completedAt: Date;
  score: number;
  note: string | null;
}) => {
  try {
    const assignment = await prismaFlowly.onboardingAssignment.findUnique({
      where: {
        onboardingAssignmentId: params.onboardingAssignmentId,
      },
      select: {
        onboardingAssignmentId: true,
        portalKey: true,
        participantReferenceType: true,
        participantReferenceId: true,
        dueAt: true,
        portalTemplate: {
          select: {
            portalName: true,
          },
        },
      },
    });

    if (
      !assignment ||
      normalizeUpper(assignment.participantReferenceType) !==
        EMPLOYEE_PARTICIPANT_REFERENCE_TYPE
    ) {
      return;
    }

    const employeeUserId = Number(assignment.participantReferenceId);
    if (!Number.isInteger(employeeUserId) || employeeUserId <= 0) {
      return;
    }

    const employee = await prismaEmployee.em_employee.findUnique({
      where: {
        UserId: employeeUserId,
      },
      select: {
        UserId: true,
        CardNo: true,
        BadgeNum: true,
        Name: true,
        Phone: true,
        email: true,
      },
    });

    if (!employee) {
      return;
    }

    const portalKey = normalizePortalKey(assignment.portalKey);
    const portalName =
      normalizeNote(assignment.portalTemplate?.portalName) ?? portalKey;
    const decisionNote =
      params.note ?? "Lulus otomatis setelah menyelesaikan semua tahap onboarding.";
    const [participantRuntimeTemplates, hrdRuntimeTemplates, picRuntimeTemplates] =
      await Promise.all([
        resolveRuntimeNotificationTemplates({
          portalKey,
          eventKey: ONBOARDING_PASSED_EVENT_KEY,
          recipientRole: PARTICIPANT_RECIPIENT_ROLE,
        }),
        resolveRuntimeNotificationTemplates({
          portalKey,
          eventKey: ONBOARDING_PASSED_EVENT_KEY,
          recipientRole: HRD_RECIPIENT_ROLE,
        }),
        resolveRuntimeNotificationTemplates({
          portalKey,
          eventKey: ONBOARDING_PASSED_EVENT_KEY,
          recipientRole: SBU_SUB_PIC_RECIPIENT_ROLE,
        }),
      ]);
    const participantTemplates = toNotificationTemplates(
      participantRuntimeTemplates,
      PARTICIPANT_RECIPIENT_ROLE
    );
    const hrdTemplates = toNotificationTemplates(
      hrdRuntimeTemplates,
      HRD_RECIPIENT_ROLE
    );
    const picTemplates = toNotificationTemplates(
      picRuntimeTemplates,
      SBU_SUB_PIC_RECIPIENT_ROLE
    );

    const [hrdRecipients, picRecipients, existingOutboxes] = await Promise.all([
      resolveHrdNotificationRecipients(),
      resolveSbuSubPicOnboardingRecipients([employee.UserId]),
      prismaFlowly.notificationOutbox.findMany({
        where: {
          eventKey: ONBOARDING_PASSED_EVENT_KEY,
          contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
          contextReferenceId: assignment.onboardingAssignmentId,
          isDeleted: false,
        },
        select: {
          recipientRole: true,
          recipientReferenceId: true,
        },
      }),
    ]);

    const existingRecipientKeys = new Set(
      existingOutboxes.map(
        (item) => `${normalizeUpper(item.recipientRole)}|${item.recipientReferenceId ?? ""}`
      )
    );
    const createNotificationOutboxId = await generateNotificationOutboxId();
    const outboxes: Prisma.NotificationOutboxCreateManyInput[] = [];
    const baseContext = buildParticipantPassedContext({
      employee,
      portalKey,
      portalName,
      dueAt: assignment.dueAt,
      completedAt: params.completedAt,
      score: params.score,
      decisionNote,
    });
    const participantPhoneNumber = normalizePhone(employee.Phone);
    const participantEmail = normalizeEmail(employee.email);

    if (
      participantTemplates.length > 0 &&
      !existingRecipientKeys.has(`${PARTICIPANT_RECIPIENT_ROLE}|${employee.UserId}`)
    ) {
      for (const template of participantTemplates) {
        const channel = normalizeUpper(template.channel);
        const phoneNumber =
          channel === CHANNEL_WHATSAPP ? participantPhoneNumber ?? "" : "";
        const email =
          channel === CHANNEL_EMAIL ? participantEmail ?? "" : participantEmail;

        if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
          logger.warn("Skipping employee onboarding passed notification without phone", {
            onboardingAssignmentId: assignment.onboardingAssignmentId,
            employeeUserId: employee.UserId,
          });
          continue;
        }

        outboxes.push({
          notificationOutboxId: createNotificationOutboxId(),
          notificationTemplateId: template.notificationTemplateId,
          portalKey,
          eventKey: ONBOARDING_PASSED_EVENT_KEY,
          recipientRole: PARTICIPANT_RECIPIENT_ROLE,
          recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
          recipientReferenceId: String(employee.UserId),
          contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
          contextReferenceId: assignment.onboardingAssignmentId,
          phoneNumber,
          message: trimMessage(renderTemplate(template.messageTemplate, baseContext)),
          status: "PENDING",
          attempts: 0,
          lastError: null,
          provider: null,
          sentAt: null,
          meta: JSON.stringify({
            channel,
            email,
            phoneNumber: participantPhoneNumber,
            onboardingAssignmentId: assignment.onboardingAssignmentId,
            employeeUserId: employee.UserId,
            employeeName: baseContext.employeeName,
            cardNumber: baseContext.cardNumber,
            portalKey,
            portalName,
            score: params.score,
            decisionNote,
            decisionAt: baseContext.decisionAt,
            dueDate: baseContext.dueDate,
            loginUrl: baseContext.loginUrl,
          }),
          isActive: true,
          isDeleted: false,
          createdAt: params.completedAt,
          createdBy: SYNC_ACTOR,
          updatedAt: params.completedAt,
          updatedBy: SYNC_ACTOR,
          deletedAt: null,
          deletedBy: null,
        });
      }
    }

    if (hrdTemplates.length > 0) {
      for (const recipient of hrdRecipients) {
        if (
          existingRecipientKeys.has(
            `${HRD_RECIPIENT_ROLE}|${recipient.userId}`
          )
        ) {
          continue;
        }

        const context = {
          ...baseContext,
          recipientName: recipient.recipientName,
        };

        for (const template of hrdTemplates) {
          const channel = normalizeUpper(template.channel);
          const phoneNumber =
            channel === CHANNEL_WHATSAPP ? recipient.phoneNumber ?? "" : "";
          const email =
            channel === CHANNEL_EMAIL ? recipient.email ?? "" : recipient.email;

          if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
            logger.warn("Skipping HRD onboarding passed notification without phone", {
              onboardingAssignmentId: assignment.onboardingAssignmentId,
              employeeUserId: employee.UserId,
              recipientUserId: recipient.userId,
            });
            continue;
          }

          outboxes.push({
            notificationOutboxId: createNotificationOutboxId(),
            notificationTemplateId: template.notificationTemplateId,
            portalKey,
            eventKey: ONBOARDING_PASSED_EVENT_KEY,
            recipientRole: HRD_RECIPIENT_ROLE,
            recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
            recipientReferenceId: String(recipient.userId),
            contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
            contextReferenceId: assignment.onboardingAssignmentId,
            phoneNumber,
            message: trimMessage(renderTemplate(template.messageTemplate, context)),
            status: "PENDING",
            attempts: 0,
            lastError: null,
            provider: null,
            sentAt: null,
            meta: JSON.stringify({
              channel,
              email,
              onboardingAssignmentId: assignment.onboardingAssignmentId,
              employeeUserId: employee.UserId,
              employeeName: baseContext.employeeName,
              cardNumber: baseContext.cardNumber,
              portalKey,
              portalName,
              score: params.score,
              decisionNote,
              decisionAt: baseContext.decisionAt,
              decisionUrl: baseContext.decisionUrl,
            }),
            isActive: true,
            isDeleted: false,
            createdAt: params.completedAt,
            createdBy: SYNC_ACTOR,
            updatedAt: params.completedAt,
            updatedBy: SYNC_ACTOR,
            deletedAt: null,
            deletedBy: null,
          });
        }
      }
    }

    if (picTemplates.length > 0) {
      for (const recipient of picRecipients) {
        if (
          existingRecipientKeys.has(
            `${SBU_SUB_PIC_RECIPIENT_ROLE}|${recipient.recipientUserId}`
          )
        ) {
          continue;
        }

        const context = buildSbuSubPicPassedContext({
          employee,
          recipient,
          portalKey,
          portalName,
          dueAt: assignment.dueAt,
          completedAt: params.completedAt,
          score: params.score,
          decisionNote,
        });

        for (const template of picTemplates) {
          const channel = normalizeUpper(template.channel);
          const phoneNumber =
            channel === CHANNEL_WHATSAPP ? recipient.phoneNumber ?? "" : "";
          const email =
            channel === CHANNEL_EMAIL ? recipient.email ?? "" : recipient.email;

          if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
            logger.warn("Skipping SBU Sub PIC onboarding passed notification without phone", {
              onboardingAssignmentId: assignment.onboardingAssignmentId,
              employeeUserId: employee.UserId,
              recipientUserId: recipient.recipientUserId,
              sbuSubId: recipient.sbuSubId,
            });
            continue;
          }

          outboxes.push({
            notificationOutboxId: createNotificationOutboxId(),
            notificationTemplateId: template.notificationTemplateId,
            portalKey,
            eventKey: ONBOARDING_PASSED_EVENT_KEY,
            recipientRole: SBU_SUB_PIC_RECIPIENT_ROLE,
            recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
            recipientReferenceId: String(recipient.recipientUserId),
            contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
            contextReferenceId: assignment.onboardingAssignmentId,
            phoneNumber,
            message: trimMessage(renderTemplate(template.messageTemplate, context)),
            status: "PENDING",
            attempts: 0,
            lastError: null,
            provider: null,
            sentAt: null,
            meta: JSON.stringify({
              channel,
              email,
              onboardingAssignmentId: assignment.onboardingAssignmentId,
              employeeUserId: employee.UserId,
              employeeName: context.employeeName,
              cardNumber: context.cardNumber,
              portalKey,
              portalName,
              score: params.score,
              decisionNote,
              decisionAt: context.decisionAt,
              sbuSubId: recipient.sbuSubId,
              sbuSubName: context.sbuSubName,
              sbuName: context.sbuName,
              pilarName: context.pilarName,
              positionName: context.positionName,
              jabatanName: context.jabatanName,
              hrdUrl: context.hrdUrl,
            }),
            isActive: true,
            isDeleted: false,
            createdAt: params.completedAt,
            createdBy: SYNC_ACTOR,
            updatedAt: params.completedAt,
            updatedBy: SYNC_ACTOR,
            deletedAt: null,
            deletedBy: null,
          });
        }
      }
    }

    if (outboxes.length > 0) {
      await prismaFlowly.notificationOutbox.createMany({
        data: outboxes,
      });
    }
  } catch (error) {
    logger.warn("Failed to enqueue onboarding passed notification", {
      onboardingAssignmentId: params.onboardingAssignmentId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const getAssignmentIdsForSyncScope = async (options: {
  participantReferenceIds: string[];
  portalKeys: string[];
  assignmentIds: string[];
}) => {
  const assignmentIds = new Set(options.assignmentIds);
  const shouldQueryScope =
    options.participantReferenceIds.length > 0 || options.portalKeys.length > 0;

  if (shouldQueryScope) {
    const assignments = await prismaFlowly.onboardingAssignment.findMany({
      where: {
        participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
        isActive: true,
        isDeleted: false,
        ...(options.participantReferenceIds.length > 0
          ? { participantReferenceId: { in: options.participantReferenceIds } }
          : {}),
        ...(options.portalKeys.length > 0
          ? { portalKey: { in: options.portalKeys } }
          : {}),
      },
      select: {
        onboardingAssignmentId: true,
      },
    });

    for (const assignment of assignments) {
      assignmentIds.add(assignment.onboardingAssignmentId);
    }
  }

  return Array.from(assignmentIds);
};

const reconcileAssignmentProgress = async (onboardingAssignmentId: string) => {
  const assignment = await prismaFlowly.onboardingAssignment.findUnique({
    where: {
      onboardingAssignmentId,
    },
    select: {
      onboardingAssignmentId: true,
      participantReferenceId: true,
      status: true,
      currentStageOrder: true,
      completedAt: true,
      completedBy: true,
      stageProgresses: {
        where: {
          isActive: true,
          isDeleted: false,
        },
        orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
        select: {
          stageOrder: true,
          status: true,
          passedAt: true,
          completedAt: true,
          examAttempts: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            orderBy: [{ attemptNo: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              score: true,
              note: true,
              endedAt: true,
            },
          },
        },
      },
    },
  });

  if (
    !assignment ||
    isAssignmentBlockedFromSync(assignment.status) ||
    assignment.stageProgresses.length === 0
  ) {
    return {
      updated: false,
      participantReferenceId: assignment?.participantReferenceId ?? null,
      passedToLms: false,
      completedAt: null as Date | null,
      score: null as number | null,
      note: null as string | null,
    };
  }

  const activeStages = assignment.stageProgresses;
  const allStagesPassed = activeStages.every((stage) =>
    isStagePassedForSync(stage.status)
  );
  const currentStatus = normalizeUpper(assignment.status);

  if (allStagesPassed) {
    const lastStage = activeStages[activeStages.length - 1];
    const lastAttempt = lastStage?.examAttempts[0] ?? null;
    const completedAt =
      lastStage?.passedAt ??
      lastStage?.completedAt ??
      lastAttempt?.endedAt ??
      assignment.completedAt ??
      new Date();
    const nextCurrentStageOrder = lastStage?.stageOrder ?? assignment.currentStageOrder;
    const shouldUpdate =
      currentStatus !== "PASSED_TO_LMS" ||
      assignment.currentStageOrder !== nextCurrentStageOrder ||
      !assignment.completedAt ||
      assignment.completedBy !== SYNC_ACTOR;

    if (shouldUpdate) {
      await prismaFlowly.onboardingAssignment.update({
        where: {
          onboardingAssignmentId,
        },
        data: {
          status: "PASSED_TO_LMS",
          currentStageOrder: nextCurrentStageOrder,
          completedAt,
          completedBy: SYNC_ACTOR,
          updatedAt: completedAt,
          updatedBy: SYNC_ACTOR,
        },
      });
    }

    await activateEmployeeLmsAccess({
      onboardingAssignmentId,
      participantReferenceId: assignment.participantReferenceId,
      updatedAt: completedAt,
    });

    return {
      updated: shouldUpdate,
      participantReferenceId: assignment.participantReferenceId,
      passedToLms: shouldUpdate && currentStatus !== "PASSED_TO_LMS",
      completedAt,
      score: normalizeScore(lastAttempt?.score),
      note: normalizeNote(lastAttempt?.note),
    };
  }

  const firstIncompleteStage = activeStages.find(
    (stage) => !isStagePassedForSync(stage.status)
  );
  if (!firstIncompleteStage) {
    return {
      updated: false,
      participantReferenceId: assignment.participantReferenceId,
      passedToLms: false,
      completedAt: null,
      score: null,
      note: null,
    };
  }

  const nextStatus = resolveOpenAssignmentStatus(firstIncompleteStage.status);
  const shouldUpdate =
    currentStatus !== nextStatus ||
    assignment.currentStageOrder !== firstIncompleteStage.stageOrder ||
    assignment.completedAt !== null ||
    assignment.completedBy !== null;

  if (shouldUpdate) {
    await prismaFlowly.onboardingAssignment.update({
      where: {
        onboardingAssignmentId,
      },
      data: {
        status: nextStatus,
        currentStageOrder: firstIncompleteStage.stageOrder,
        completedAt: null,
        completedBy: null,
        updatedAt: new Date(),
        updatedBy: SYNC_ACTOR,
      },
    });
  }

  return {
    updated: shouldUpdate,
    participantReferenceId: assignment.participantReferenceId,
    passedToLms: false,
    completedAt: null,
    score: null,
    note: null,
  };
};

export class OnboardingExamResultSyncService {
  static async syncReleasedResults(options: SyncReleasedResultsOptions = {}) {
    const participantReferenceIds = uniqueTexts(options.participantReferenceIds);
    const portalKeys = uniqueTexts(options.portalKeys).map((value) =>
      value.toUpperCase()
    );
    const examSessionIds = uniqueTexts(options.examSessionIds);

    const where: Prisma.OnboardingExamAttemptWhereInput = {
      isDeleted: false,
      employeeExamSessionId:
        examSessionIds.length > 0 ? { in: examSessionIds } : { not: null },
      status: {
        in: ["IN_PROGRESS", "WAITING_ADMIN"],
      },
      assignment: {
        participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
        isDeleted: false,
        ...(participantReferenceIds.length > 0
          ? { participantReferenceId: { in: participantReferenceIds } }
          : {}),
        ...(portalKeys.length > 0 ? { portalKey: { in: portalKeys } } : {}),
      },
    };

    const attempts = await prismaFlowly.onboardingExamAttempt.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        onboardingExamAttemptId: true,
        onboardingAssignmentId: true,
        onboardingStageProgressId: true,
        employeeExamSessionId: true,
        attemptNo: true,
        status: true,
        submittedAt: true,
        endedAt: true,
        stageExam: {
          select: {
            passScore: true,
          },
        },
        stageProgress: {
          select: {
            stageOrder: true,
            status: true,
            remedialCount: true,
            passedAt: true,
            completedAt: true,
            assignment: {
              select: {
                status: true,
                currentStageOrder: true,
                participantReferenceId: true,
              },
            },
          },
        },
      },
    });

    const stageProgressIds = uniqueTexts(
      attempts.map((attempt) => attempt.onboardingStageProgressId)
    );
    const allAttemptsForStageProgress =
      stageProgressIds.length > 0
        ? await prismaFlowly.onboardingExamAttempt.findMany({
            where: {
              onboardingStageProgressId: {
                in: stageProgressIds,
              },
              isActive: true,
              isDeleted: false,
            },
            select: {
              onboardingExamAttemptId: true,
              onboardingStageProgressId: true,
              attemptNo: true,
              status: true,
            },
          })
        : [];
    const sessionIds = uniqueTexts(
      attempts.map((attempt) => attempt.employeeExamSessionId ?? "")
    );

    const releasedSessions =
      sessionIds.length > 0
        ? await prismaEmployee.em_session_exams.findMany({
            where: {
              exams_id: { in: sessionIds },
              is_selesai: FINISHED_FLAG,
              is_correct: RELEASED_FLAG,
              is_score_akhir: { not: null },
            },
            select: {
              exams_id: true,
              start_time: true,
              end_time: true,
              is_notes: true,
              is_score_akhir: true,
            },
          })
        : [];

    const sessionMap = new Map(
      releasedSessions
        .filter((session) => session.exams_id)
        .map((session) => [session.exams_id ?? "", session] as const)
    );
    const latestAttemptNoByStageProgress = new Map<string, number>();
    const attemptsByStageProgress = new Map<
      string,
      typeof allAttemptsForStageProgress
    >();
    for (const attempt of allAttemptsForStageProgress) {
      const stageAttempts =
        attemptsByStageProgress.get(attempt.onboardingStageProgressId) ?? [];
      stageAttempts.push(attempt);
      attemptsByStageProgress.set(attempt.onboardingStageProgressId, stageAttempts);

      const latestAttemptNo =
        latestAttemptNoByStageProgress.get(attempt.onboardingStageProgressId) ?? 0;
      if (attempt.attemptNo > latestAttemptNo) {
        latestAttemptNoByStageProgress.set(
          attempt.onboardingStageProgressId,
          attempt.attemptNo
        );
      }
    }

    let synced = 0;
    const processedAssignmentIds = new Set<string>();
    for (const attempt of attempts) {
      if (
        attempt.attemptNo <
        (latestAttemptNoByStageProgress.get(attempt.onboardingStageProgressId) ?? 0)
      ) {
        continue;
      }

      const session = attempt.employeeExamSessionId
        ? sessionMap.get(attempt.employeeExamSessionId)
        : null;
      if (!session || isAssignmentBlockedFromSync(attempt.stageProgress.assignment.status)) {
        continue;
      }
      processedAssignmentIds.add(attempt.onboardingAssignmentId);

      const score = normalizeScore(session.is_score_akhir);
      if (score === null) {
        continue;
      }

      const releaseNote = normalizeNote(session.is_notes);
      const releasedAt = session.end_time ?? attempt.endedAt ?? new Date();
      const submittedAt = attempt.submittedAt ?? session.end_time ?? releasedAt;
      const passScore = Math.max(
        0,
        Number(attempt.stageExam.passScore ?? DEFAULT_PASS_SCORE)
      );
      const isPassed = score >= passScore;
      const nextStatus = isPassed ? "PASSED" : "REMEDIAL";
      const nextRemedialCount = (
        attemptsByStageProgress.get(attempt.onboardingStageProgressId) ?? []
      ).filter((stageAttempt) => {
        const status =
          stageAttempt.onboardingExamAttemptId === attempt.onboardingExamAttemptId
            ? nextStatus
            : stageAttempt.status;
        return normalizeUpper(status) === "REMEDIAL";
      }).length;
      let shouldNotifyPassedToLms = false;

      await prismaFlowly.$transaction(async (tx) => {
        const nextStage = isPassed
          ? await tx.onboardingStageProgress.findFirst({
              where: {
                onboardingAssignmentId: attempt.onboardingAssignmentId,
                stageOrder: { gt: attempt.stageProgress.stageOrder },
                isActive: true,
                isDeleted: false,
              },
              orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
              select: {
                onboardingStageProgressId: true,
                stageOrder: true,
                status: true,
                startedAt: true,
              },
            })
          : null;

        await tx.onboardingExamAttempt.update({
          where: {
            onboardingExamAttemptId: attempt.onboardingExamAttemptId,
          },
          data: {
            score,
            submittedAt,
            endedAt: releasedAt,
            status: nextStatus,
            note: releaseNote,
            updatedAt: releasedAt,
            updatedBy: SYNC_ACTOR,
          },
        });

        await tx.onboardingStageProgress.update({
          where: {
            onboardingStageProgressId: attempt.onboardingStageProgressId,
          },
          data: {
            status: nextStatus,
            completedAt: releasedAt,
            passedAt: isPassed
              ? attempt.stageProgress.passedAt ?? releasedAt
              : attempt.stageProgress.passedAt,
            remedialCount: nextRemedialCount,
            note: releaseNote,
            updatedAt: releasedAt,
            updatedBy: SYNC_ACTOR,
          },
        });

        if (isPassed && nextStage) {
          const nextStageStatus = normalizeUpper(nextStage.status);
          if (
            nextStageStatus === "LOCKED" ||
            nextStageStatus === "PENDING" ||
            nextStageStatus === "NOT_STARTED"
          ) {
            await tx.onboardingStageProgress.update({
              where: {
                onboardingStageProgressId: nextStage.onboardingStageProgressId,
              },
              data: {
                status: "READING",
                startedAt: nextStage.startedAt ?? releasedAt,
                updatedAt: releasedAt,
                updatedBy: SYNC_ACTOR,
              },
            });
          }

          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "IN_PROGRESS",
              currentStageOrder: nextStage.stageOrder,
              completedAt: null,
              completedBy: null,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
        } else if (isPassed) {
          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "PASSED_TO_LMS",
              currentStageOrder: attempt.stageProgress.stageOrder,
              completedAt: releasedAt,
              completedBy: SYNC_ACTOR,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
          shouldNotifyPassedToLms = true;
        } else {
          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "REMEDIAL",
              currentStageOrder: attempt.stageProgress.stageOrder,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
        }
      });

      invalidateProfileCache(attempt.stageProgress.assignment.participantReferenceId);
      if (shouldNotifyPassedToLms) {
        await enqueueOnboardingPassedNotifications({
          onboardingAssignmentId: attempt.onboardingAssignmentId,
          completedAt: releasedAt,
          score,
          note: releaseNote,
        });
      }
      synced += 1;
    }

    const assignmentIdsToReconcile = await getAssignmentIdsForSyncScope({
      participantReferenceIds,
      portalKeys,
      assignmentIds: Array.from(processedAssignmentIds),
    });
    for (const onboardingAssignmentId of assignmentIdsToReconcile) {
      const reconciliation = await reconcileAssignmentProgress(onboardingAssignmentId);
      if (reconciliation.updated && reconciliation.participantReferenceId) {
        invalidateProfileCache(reconciliation.participantReferenceId);
      }

      if (
        reconciliation.passedToLms &&
        reconciliation.completedAt &&
        reconciliation.score !== null
      ) {
        await enqueueOnboardingPassedNotifications({
          onboardingAssignmentId,
          completedAt: reconciliation.completedAt,
          score: reconciliation.score,
          note: reconciliation.note,
        });
      }
    }

    return { synced };
  }
}
