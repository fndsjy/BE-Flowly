// src/utils/id-generator.ts
import { prismaFlowly } from "../application/database.js";

const prisma = prismaFlowly;

function getDDMMYY(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${day}${month}${year}`;
}

// ✅ Helper: extract sequence number safely
function extractSeqFromId(id: string): number {
  const parts = id.split("-");
  // Jika tidak ada "-", atau bagian ke-2 tidak angka → fallback ke 0
  const rawSeq = parts.length > 1 ? (parts[1] ?? "") : "";
  const num = parseInt(rawSeq, 10);
  return isNaN(num) ? 0 : num;
}

export async function generateUserId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `USR${today}`;

  // Ambil ID terbesar hari ini (termasuk deleted — hindari duplikat)
  const existing = await prisma.user.findFirst({
    where: { userId: { startsWith: prefix } },
    select: { userId: true },
    orderBy: { userId: "desc" }, // leksikografis descending: USRxx-0010 > USRxx-0009
  });

  let nextSeq = 1;
  if (existing?.userId) {
    const currentSeq = extractSeqFromId(existing.userId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

export async function generateRoleId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `ROL${today}`;

  const existing = await prisma.role.findFirst({
    where: { roleId: { startsWith: prefix } },
    select: { roleId: true },
    orderBy: { roleId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.roleId) {
    const currentSeq = extractSeqFromId(existing.roleId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

export async function generateChartId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `CHT${today}`;

  const existing = await prisma.chart.findFirst({
    where: { chartId: { startsWith: prefix } },
    select: { chartId: true },
    orderBy: { chartId: "desc" }
  });

  let nextSeq = 1;
  if (existing?.chartId) {
    const currentSeq = extractSeqFromId(existing.chartId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateChartMemberId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `CHM${today}`;

  const existing = await prisma.chartMember.findFirst({
    where: { memberChartId: { startsWith: prefix } },
    select: { memberChartId: true },
    orderBy: { memberChartId: "desc" }
  });

  let nextSeq = 1;
  if (existing?.memberChartId) {
    const currentSeq = extractSeqFromId(existing.memberChartId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateJabatanId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `JBT${today}`;

  const existing = await prisma.jabatan.findFirst({
    where: { jabatanId: { startsWith: prefix } },
    select: { jabatanId: true },
    orderBy: { jabatanId: "desc" }
  });

  let nextSeq = 1;
  if (existing?.jabatanId) {
    const currentSeq = extractSeqFromId(existing.jabatanId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateAcessRoleId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `ACR${today}`;

  const existing = await prisma.accessRole.findFirst({
    where: { accessId: { startsWith: prefix } },
    select: { accessId: true },
    orderBy: { accessId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.accessId) {
    const currentSeq = extractSeqFromId(existing.accessId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generatemasAccessId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `MAR${today}`;

  const existing = await prisma.masterAccessRole.findFirst({
    where: { masAccessId: { startsWith: prefix } },
    select: { masAccessId: true },
    orderBy: { masAccessId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.masAccessId) {
    const currentSeq = extractSeqFromId(existing.masAccessId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(5, "0")}`;
}

export async function generateProcedureSopId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `SOP${today}`;

  const existing = await prisma.procedureSop.findFirst({
    where: { sopId: { startsWith: prefix } },
    select: { sopId: true },
    orderBy: { sopId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.sopId) {
    const currentSeq = extractSeqFromId(existing.sopId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateMasterIkId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `IK${today}`;

  const existing = await prisma.masterIK.findFirst({
    where: { ikId: { startsWith: prefix } },
    select: { ikId: true },
    orderBy: { ikId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.ikId) {
    const currentSeq = extractSeqFromId(existing.ikId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateProcedureSopIkId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `SIK${today}`;

  const existing = await prisma.procedureSopIK.findFirst({
    where: { sopIkId: { startsWith: prefix } },
    select: { sopIkId: true },
    orderBy: { sopIkId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.sopIkId) {
    const currentSeq = extractSeqFromId(existing.sopIkId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(5, "0")}`;
}

export async function generateMasterFishboneId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `FBN${today}`;

  const existing = await prisma.masterFishbone.findFirst({
    where: { fishboneId: { startsWith: prefix } },
    select: { fishboneId: true },
    orderBy: { fishboneId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.fishboneId) {
    const currentSeq = extractSeqFromId(existing.fishboneId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateFishboneCategoryId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `FCG${today}`;

  const existing = await prisma.fishboneCategory.findFirst({
    where: { fishboneCategoryId: { startsWith: prefix } },
    select: { fishboneCategoryId: true },
    orderBy: { fishboneCategoryId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.fishboneCategoryId) {
    const currentSeq = extractSeqFromId(existing.fishboneCategoryId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(5, "0")}`;
}

export async function generateFishboneCauseId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `FBC${today}`;

  const existing = await prisma.fishboneCause.findFirst({
    where: { fishboneCauseId: { startsWith: prefix } },
    select: { fishboneCauseId: true },
    orderBy: { fishboneCauseId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.fishboneCauseId) {
    const currentSeq = extractSeqFromId(existing.fishboneCauseId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(5, "0")}`;
}

export async function generateFishboneItemId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `FBI${today}`;

  const existing = await prisma.fishboneItem.findFirst({
    where: { fishboneItemId: { startsWith: prefix } },
    select: { fishboneItemId: true },
    orderBy: { fishboneItemId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.fishboneItemId) {
    const currentSeq = extractSeqFromId(existing.fishboneItemId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(5, "0")}`;
}

export async function generateFishboneItemCauseId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `FIC${today}`;

  const existing = await prisma.fishboneItemCause.findFirst({
    where: { fishboneItemCauseId: { startsWith: prefix } },
    select: { fishboneItemCauseId: true },
    orderBy: { fishboneItemCauseId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.fishboneItemCauseId) {
    const currentSeq = extractSeqFromId(existing.fishboneItemCauseId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(5, "0")}`;
}

export async function generateProcedureIkId(): Promise<string> {
  return generateMasterIkId();
}

export async function generateCaseId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `CAS${today}`;

  const existing = await prisma.caseHeader.findFirst({
    where: { caseId: { startsWith: prefix } },
    select: { caseId: true },
    orderBy: { caseId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseId) {
    const currentSeq = extractSeqFromId(existing.caseId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

export async function generateCaseDepartmentId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CSD${today}`;

  const existing = await prisma.caseDepartment.findFirst({
    where: { caseDepartmentId: { startsWith: prefix } },
    select: { caseDepartmentId: true },
    orderBy: { caseDepartmentId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseDepartmentId) {
    const currentSeq = extractSeqFromId(existing.caseDepartmentId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseAttachmentId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CAD${today}`;

  const existing = await prisma.caseAttachment.findFirst({
    where: { caseAttachmentId: { startsWith: prefix } },
    select: { caseAttachmentId: true },
    orderBy: { caseAttachmentId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseAttachmentId) {
    const currentSeq = extractSeqFromId(existing.caseAttachmentId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseFishboneId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `CFB${today}`;

  const existing = await prisma.caseFishboneMaster.findFirst({
    where: { caseFishboneId: { startsWith: prefix } },
    select: { caseFishboneId: true },
    orderBy: { caseFishboneId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseFishboneId) {
    const currentSeq = extractSeqFromId(existing.caseFishboneId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

export async function generateCaseFishboneCauseId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CFC${today}`;

  const existing = await prisma.caseFishboneCause.findFirst({
    where: { caseFishboneCauseId: { startsWith: prefix } },
    select: { caseFishboneCauseId: true },
    orderBy: { caseFishboneCauseId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseFishboneCauseId) {
    const currentSeq = extractSeqFromId(existing.caseFishboneCauseId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseFishboneItemId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CFI${today}`;

  const existing = await prisma.caseFishboneItem.findFirst({
    where: { caseFishboneItemId: { startsWith: prefix } },
    select: { caseFishboneItemId: true },
    orderBy: { caseFishboneItemId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseFishboneItemId) {
    const currentSeq = extractSeqFromId(existing.caseFishboneItemId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseFishboneItemCauseId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CFIC${today}`;

  const existing = await prisma.caseFishboneItemCause.findFirst({
    where: { caseFishboneItemCauseId: { startsWith: prefix } },
    select: { caseFishboneItemCauseId: true },
    orderBy: { caseFishboneItemCauseId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseFishboneItemCauseId) {
    const currentSeq = extractSeqFromId(existing.caseFishboneItemCauseId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseNotificationId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CNO${today}`;

  const existing = await (prisma as typeof prisma & {
    caseNotificationOutbox: { findFirst: (args: unknown) => Promise<{ caseNotificationId: string } | null> };
  }).caseNotificationOutbox.findFirst({
    where: { caseNotificationId: { startsWith: prefix } },
    select: { caseNotificationId: true },
    orderBy: { caseNotificationId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseNotificationId) {
    const currentSeq = extractSeqFromId(existing.caseNotificationId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseNotificationMessageId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CNM${today}`;

  const existing = await (prisma as typeof prisma & {
    caseNotificationMessage: {
      findFirst: (
        args: unknown
      ) => Promise<{ caseNotificationMessageId: string } | null>;
    };
  }).caseNotificationMessage.findFirst({
    where: { caseNotificationMessageId: { startsWith: prefix } },
    select: { caseNotificationMessageId: true },
    orderBy: { caseNotificationMessageId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseNotificationMessageId) {
    const currentSeq = extractSeqFromId(existing.caseNotificationMessageId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}

export async function generateCaseNotificationTemplateId(): Promise<() => string> {
  const today = getDDMMYY();
  const prefix = `CNT${today}`;

  const existing = await (prisma as typeof prisma & {
    caseNotificationTemplate: {
      findFirst: (
        args: unknown
      ) => Promise<{ caseNotificationTemplateId: string } | null>;
    };
  }).caseNotificationTemplate.findFirst({
    where: { caseNotificationTemplateId: { startsWith: prefix } },
    select: { caseNotificationTemplateId: true },
    orderBy: { caseNotificationTemplateId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.caseNotificationTemplateId) {
    const currentSeq = extractSeqFromId(existing.caseNotificationTemplateId);
    nextSeq = currentSeq + 1;
  }

  return () => `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
}
