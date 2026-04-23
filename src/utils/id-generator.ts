import { prismaFlowly } from "../application/database.js";

const prisma = prismaFlowly;

type IdSequenceRow = {
  generatedId: string | null;
};

const getDDMMYY = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${day}${month}${year}`;
};

const makeTodayPrefix = (code: string) => `${code}${getDDMMYY()}`;

const escapeSqlIdentifier = (value: string) => `[${value.replace(/]/g, "]]")}]`;

const extractSeqFromId = (id: string): number => {
  const parts = id.split("-");
  const rawSeq = parts.length > 1 ? (parts[1] ?? "") : "";
  const sequence = parseInt(rawSeq, 10);
  return Number.isNaN(sequence) ? 0 : sequence;
};

const formatGeneratedId = (prefix: string, sequence: number, minimumDigits: number) =>
  `${prefix}-${String(sequence).padStart(minimumDigits, "0")}`;

const getNextSequence = async (
  tableName: string,
  idColumnName: string,
  prefix: string
): Promise<number> => {
  const table = escapeSqlIdentifier(tableName);
  const column = escapeSqlIdentifier(idColumnName);

  const rows = await prisma.$queryRawUnsafe<IdSequenceRow[]>(
    `
      SELECT TOP 1 ${column} AS generatedId
      FROM [dbo].${table}
      WHERE ${column} LIKE @P1
      ORDER BY
        TRY_CONVERT(BIGINT, SUBSTRING(${column}, CHARINDEX('-', ${column}) + 1, LEN(${column}))) DESC,
        LEN(SUBSTRING(${column}, CHARINDEX('-', ${column}) + 1, LEN(${column}))) DESC,
        ${column} DESC
    `,
    `${prefix}-%`
  );

  const latestId = rows[0]?.generatedId;
  if (!latestId) {
    return 1;
  }

  return extractSeqFromId(latestId) + 1;
};

const generateSingleId = async (
  tableName: string,
  idColumnName: string,
  prefix: string,
  minimumDigits: number
) => {
  const nextSequence = await getNextSequence(tableName, idColumnName, prefix);
  return formatGeneratedId(prefix, nextSequence, minimumDigits);
};

const generateIdFactory = async (
  tableName: string,
  idColumnName: string,
  prefix: string,
  minimumDigits: number
) => {
  let nextSequence = await getNextSequence(tableName, idColumnName, prefix);

  return () => formatGeneratedId(prefix, nextSequence++, minimumDigits);
};

export async function generateUserId(): Promise<string> {
  return generateSingleId("users", "userId", makeTodayPrefix("USR"), 4);
}

export async function generateRoleId(): Promise<string> {
  return generateSingleId("roles", "roleId", makeTodayPrefix("ROL"), 4);
}

export async function generateChartId(): Promise<string> {
  return generateSingleId("chart", "chartId", makeTodayPrefix("CHT"), 5);
}

export async function generateChartMemberId(): Promise<string> {
  return generateSingleId("chart_member", "memberChartId", makeTodayPrefix("CHM"), 5);
}

export async function generateJabatanId(): Promise<string> {
  return generateSingleId("jabatan", "jabatanId", makeTodayPrefix("JBT"), 5);
}

export async function generateAcessRoleId(): Promise<string> {
  return generateSingleId("access_role", "accessId", makeTodayPrefix("ACR"), 5);
}

export async function generatemasAccessId(): Promise<() => string> {
  return generateIdFactory("master_access_role", "masAccessId", makeTodayPrefix("MAR"), 5);
}

export async function generatePortalMenuMapId(): Promise<() => string> {
  return generateIdFactory("portal_menu_map", "portalMenuMapId", makeTodayPrefix("PMM"), 5);
}

export async function generateProcedureSopId(): Promise<string> {
  return generateSingleId("procedure_sop", "sopId", makeTodayPrefix("SOP"), 5);
}

export async function generateMasterIkId(): Promise<string> {
  return generateSingleId("master_ik", "ikId", makeTodayPrefix("IK"), 5);
}

export async function generateProcedureSopIkId(): Promise<() => string> {
  return generateIdFactory("procedure_sop_ik", "sopIkId", makeTodayPrefix("SIK"), 5);
}

export async function generateMasterFishboneId(): Promise<string> {
  return generateSingleId("master_fishbone", "fishboneId", makeTodayPrefix("FBN"), 5);
}

export async function generateFishboneCategoryId(): Promise<string> {
  return generateSingleId(
    "fishbone_category",
    "fishboneCategoryId",
    makeTodayPrefix("FCG"),
    5
  );
}

export async function generateFishboneCauseId(): Promise<() => string> {
  return generateIdFactory("fishbone_cause", "fishboneCauseId", makeTodayPrefix("FBC"), 5);
}

export async function generateFishboneItemId(): Promise<() => string> {
  return generateIdFactory("fishbone_item", "fishboneItemId", makeTodayPrefix("FBI"), 5);
}

export async function generateFishboneItemCauseId(): Promise<() => string> {
  return generateIdFactory(
    "fishbone_item_cause",
    "fishboneItemCauseId",
    makeTodayPrefix("FIC"),
    5
  );
}

export async function generateProcedureIkId(): Promise<string> {
  return generateMasterIkId();
}

export async function generateCaseId(): Promise<string> {
  return generateSingleId("case_header", "caseId", makeTodayPrefix("CAS"), 4);
}

export async function generateCaseDepartmentId(): Promise<() => string> {
  return generateIdFactory(
    "case_department",
    "caseDepartmentId",
    makeTodayPrefix("CSD"),
    4
  );
}

export async function generateCaseDepartmentAssigneeId(): Promise<() => string> {
  return generateIdFactory(
    "case_department_assignee",
    "caseDepartmentAssigneeId",
    makeTodayPrefix("CDA"),
    4
  );
}

export async function generateCaseAttachmentId(): Promise<() => string> {
  return generateIdFactory("case_attachment", "caseAttachmentId", makeTodayPrefix("CAD"), 4);
}

export async function generateCaseFishboneId(): Promise<string> {
  return generateSingleId("case_fishbone_master", "caseFishboneId", makeTodayPrefix("CFB"), 4);
}

export async function generateCaseFishboneCauseId(): Promise<() => string> {
  return generateIdFactory(
    "case_fishbone_cause",
    "caseFishboneCauseId",
    makeTodayPrefix("CFC"),
    4
  );
}

export async function generateCaseFishboneItemId(): Promise<() => string> {
  return generateIdFactory(
    "case_fishbone_item",
    "caseFishboneItemId",
    makeTodayPrefix("CFI"),
    4
  );
}

export async function generateCaseFishboneItemCauseId(): Promise<() => string> {
  return generateIdFactory(
    "case_fishbone_item_cause",
    "caseFishboneItemCauseId",
    makeTodayPrefix("CFIC"),
    4
  );
}

export async function generateCasePdcaItemId(): Promise<() => string> {
  return generateIdFactory("case_pdca_item", "casePdcaItemId", makeTodayPrefix("CPD"), 4);
}

export async function generateCaseFeedbackCommentId(): Promise<() => string> {
  return generateIdFactory(
    "case_feedback_comment",
    "caseFeedbackCommentId",
    makeTodayPrefix("CFC"),
    4
  );
}

export async function generateCaseNotificationId(): Promise<() => string> {
  return generateIdFactory(
    "case_notification_outbox",
    "caseNotificationId",
    makeTodayPrefix("CNO"),
    4
  );
}

export async function generateCaseNotificationMessageId(): Promise<() => string> {
  return generateIdFactory(
    "case_notification_message",
    "caseNotificationMessageId",
    makeTodayPrefix("CNM"),
    4
  );
}

export async function generateCaseNotificationTemplateId(): Promise<() => string> {
  return generateIdFactory(
    "case_notification_template",
    "caseNotificationTemplateId",
    makeTodayPrefix("CNT"),
    4
  );
}

export async function generateNotificationTemplateId(): Promise<() => string> {
  return generateIdFactory(
    "notification_template",
    "notificationTemplateId",
    makeTodayPrefix("NTF"),
    4
  );
}

export async function generateNotificationTemplatePortalId(): Promise<() => string> {
  return generateIdFactory(
    "notification_template_portal",
    "notificationTemplatePortalId",
    makeTodayPrefix("NTP"),
    4
  );
}

export async function generateNotificationOutboxId(): Promise<() => string> {
  return generateIdFactory(
    "notification_outbox",
    "notificationOutboxId",
    makeTodayPrefix("NOB"),
    4
  );
}

export async function generateOnboardingPortalTemplateId(): Promise<string> {
  return generateSingleId(
    "onboarding_portal_template",
    "onboardingPortalTemplateId",
    makeTodayPrefix("OPT"),
    5
  );
}

export async function generateOnboardingStageTemplateId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_stage_template",
    "onboardingStageTemplateId",
    makeTodayPrefix("OST"),
    5
  );
}

export async function generateOnboardingStageMaterialId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_stage_material",
    "onboardingStageMaterialId",
    makeTodayPrefix("OSM"),
    5
  );
}

export async function generateOnboardingStageExamId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_stage_exam",
    "onboardingStageExamId",
    makeTodayPrefix("OSE"),
    5
  );
}

export async function generateOnboardingAssignmentId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_assignment",
    "onboardingAssignmentId",
    makeTodayPrefix("OAS"),
    5
  );
}

export async function generateOnboardingStageProgressId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_stage_progress",
    "onboardingStageProgressId",
    makeTodayPrefix("OSP"),
    5
  );
}

export async function generateOnboardingMaterialProgressId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_material_progress",
    "onboardingMaterialProgressId",
    makeTodayPrefix("OMP"),
    5
  );
}

export async function generateOnboardingExamAttemptId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_exam_attempt",
    "onboardingExamAttemptId",
    makeTodayPrefix("OEA"),
    5
  );
}

export async function generateOnboardingDecisionId(): Promise<() => string> {
  return generateIdFactory(
    "onboarding_decision",
    "onboardingDecisionId",
    makeTodayPrefix("ODC"),
    5
  );
}
