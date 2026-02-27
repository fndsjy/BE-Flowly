import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseAttachmentValidation } from "../validation/case-attachment-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseAttachmentId } from "../utils/id-generator.js";
import {
  buildChanges,
  pickSnapshot,
  resolveActorType,
  writeAuditLog,
} from "../utils/audit-log.js";
import {
  assertCaseCrud,
  assertCaseRead,
  getEmployeeChartSbuSubIds,
  resolveCaseAccess,
} from "../utils/case-access.js";
import { CASE_MEDIA_TYPES, normalizeUpper } from "../utils/case-constants.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCaseAttachmentRequest,
  type UpdateCaseAttachmentRequest,
  type DeleteCaseAttachmentRequest,
  toCaseAttachmentResponse,
  toCaseAttachmentListResponse,
} from "../model/case-attachment-model.js";

const CASE_ATTACHMENT_FIELDS = [
  "caseId",
  "mediaType",
  "filePath",
  "fileName",
  "fileMime",
  "fileSize",
  "caption",
  "locationDesc",
  "orderIndex",
  "isActive",
  "isDeleted",
] as const;

const getAttachmentSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CASE_ATTACHMENT_FIELDS as unknown as string[]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CASE_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "public",
  "assets",
  "case"
);
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB

const normalizeNullableText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeMediaType = (value: string) => {
  const normalized = normalizeUpper(value);
  if (
    !CASE_MEDIA_TYPES.includes(normalized as (typeof CASE_MEDIA_TYPES)[number])
  ) {
    throw new ResponseError(400, "Invalid mediaType");
  }
  return normalized;
};

const parseFileData = (fileData: string) => {
  const match = fileData.match(/^data:(.+);base64,(.*)$/);
  const base64 = match?.[2] ?? fileData;
  const mime = match?.[1] ?? "application/octet-stream";
  return { mime, base64 };
};

const extensionFromMime = (mime: string) => {
  const normalized = mime.toLowerCase();
  if (normalized === "image/jpeg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/gif") return "gif";
  if (normalized === "video/mp4") return "mp4";
  if (normalized === "video/quicktime") return "mov";
  if (normalized === "video/x-matroska") return "mkv";
  if (normalized === "video/webm") return "webm";
  return "bin";
};

const mimeFromFileName = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".mkv") return "video/x-matroska";
  if (ext === ".webm") return "video/webm";
  return null;
};

const formatTimestamp = (timestamp: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(
    timestamp.getDate()
  )}_${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(
    timestamp.getSeconds()
  )}`;
};

const sanitizeFilePart = (value: string) => {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9]+/g, "_");
  return sanitized.replace(/^_+|_+$/g, "") || "CASE";
};

const buildCaseFileName = (
  caseId: string,
  mediaType: string,
  timestamp: Date,
  extension: string
) => {
  const base = sanitizeFilePart(caseId).slice(0, 60);
  const type = sanitizeFilePart(mediaType).slice(0, 20);
  const dateStamp = formatTimestamp(timestamp);
  return `${base}_${type}_${dateStamp}.${extension}`;
};

const buildDeletedFileName = (originalFileName: string, timestamp: Date) => {
  const parsed = path.parse(originalFileName);
  const base = parsed.name || "CASE";
  const ext = parsed.ext || "";
  const dateStamp = formatTimestamp(timestamp);
  return `${base}_Deleted_${dateStamp}${ext}`;
};

const ensureEmployeeCaseAccess = async (employeeId: number, caseId: string) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: { requesterEmployeeId: true, isDeleted: true },
  });

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  if (caseHeader.requesterEmployeeId === employeeId) {
    return;
  }

  const assigned = await prismaFlowly.caseDepartment.findFirst({
    where: {
      caseId,
      assigneeEmployeeId: employeeId,
      isDeleted: false,
    },
    select: { caseDepartmentId: true },
  });

  if (assigned) {
    return;
  }

  const picSubs = await prismaEmployee.em_sbu_sub.findMany({
    where: {
      pic: employeeId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });
  const picIds = picSubs.map((sub) => sub.id);

  if (picIds.length === 0) {
    throw new ResponseError(403, "No access to this case");
  }

  const hasDept = await prismaFlowly.caseDepartment.findFirst({
    where: {
      caseId,
      sbuSubId: { in: picIds },
      isDeleted: false,
    },
    select: { caseDepartmentId: true },
  });

  if (!hasDept) {
    throw new ResponseError(403, "No access to this case");
  }
};

const ensureEmployeeCaseReadAccess = async (
  employeeId: number,
  caseId: string
) => {
  const caseHeader = (await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: {
      requesterEmployeeId: true,
      originSbuSubId: true,
      visibility: true,
      isDeleted: true,
    } as any,
  })) as
    | {
        requesterEmployeeId: number | null;
        originSbuSubId: number | null;
        visibility?: string | null;
        isDeleted: boolean;
      }
    | null;

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  if (caseHeader.requesterEmployeeId === employeeId) {
    return;
  }

  const assigned = await prismaFlowly.caseDepartment.findFirst({
    where: {
      caseId,
      assigneeEmployeeId: employeeId,
      isDeleted: false,
    },
    select: { caseDepartmentId: true },
  });

  if (assigned) {
    return;
  }

  const picSubs = await prismaEmployee.em_sbu_sub.findMany({
    where: {
      pic: employeeId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });
  const picIds = picSubs.map((sub) => sub.id);

  if (picIds.length > 0) {
    const hasDept = await prismaFlowly.caseDepartment.findFirst({
      where: {
        caseId,
        sbuSubId: { in: picIds },
        isDeleted: false,
      },
      select: { caseDepartmentId: true },
    });

    if (hasDept) {
      return;
    }
  }

  const visibility = String(
    (caseHeader as { visibility?: string | null }).visibility ?? "PRIVATE"
  ).toUpperCase();

  if (visibility === "PUBLIC") {
    const chartSbuSubIds = await getEmployeeChartSbuSubIds(employeeId);
    if (chartSbuSubIds.length > 0) {
      if (
        caseHeader.originSbuSubId &&
        chartSbuSubIds.includes(caseHeader.originSbuSubId)
      ) {
        return;
      }

      const hasDept = await prismaFlowly.caseDepartment.findFirst({
        where: {
          caseId,
          sbuSubId: { in: chartSbuSubIds },
          isDeleted: false,
        },
        select: { caseDepartmentId: true },
      });

      if (hasDept) {
        return;
      }
    }
  }

  throw new ResponseError(403, "No access to this case");
};

export class CaseAttachmentService {
  static async create(
    requesterId: string,
    reqBody: CreateCaseAttachmentRequest
  ) {
    const request = Validation.validate(CaseAttachmentValidation.CREATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    } else if (access.employeeId !== undefined) {
      await ensureEmployeeCaseAccess(access.employeeId, request.caseId);
    }

    const caseHeader = await prismaFlowly.caseHeader.findUnique({
      where: { caseId: request.caseId },
      select: { caseId: true, isDeleted: true },
    });

    if (!caseHeader || caseHeader.isDeleted) {
      throw new ResponseError(404, "Case not found");
    }

    const createId = await generateCaseAttachmentId();
    const now = new Date();

    const mediaType = normalizeMediaType(request.mediaType);
    const hasFileData = Boolean(request.fileData);

    let filePath = request.filePath?.trim();
    let fileName = request.fileName?.trim();
    let fileMime = normalizeNullableText(request.fileMime) ?? null;
    let fileSize = request.fileSize ?? null;
    let fileFullPath: string | null = null;

    if (hasFileData) {
      const { base64, mime } = parseFileData(request.fileData as string);
      const fileBuffer = Buffer.from(base64, "base64");
      if (!fileBuffer.length) {
        throw new ResponseError(400, "Attachment file tidak valid");
      }
      if (fileBuffer.length > MAX_ATTACHMENT_SIZE) {
        throw new ResponseError(400, "Ukuran file terlalu besar");
      }
      const isImage = mime.toLowerCase().startsWith("image/");
      const isVideo = mime.toLowerCase().startsWith("video/");
      if (!isImage && !isVideo) {
        throw new ResponseError(400, "File harus berupa gambar atau video");
      }

      const inferredType = isImage ? "PHOTO" : "VIDEO";
      if (mediaType !== inferredType) {
        throw new ResponseError(400, "mediaType tidak sesuai dengan file");
      }

      const ext = extensionFromMime(mime);
      fileName = buildCaseFileName(request.caseId, mediaType, now, ext);
      filePath = `/assets/case/${fileName}`;
      fileMime = mime;
      fileSize = fileBuffer.length;

      fileFullPath = path.join(CASE_UPLOAD_DIR, fileName);
      await fs.mkdir(CASE_UPLOAD_DIR, { recursive: true });
      await fs.writeFile(fileFullPath, fileBuffer);
    } else {
      if (!filePath || !fileName) {
        throw new ResponseError(
          400,
          "filePath dan fileName wajib diisi jika fileData tidak disertakan"
        );
      }
    }

    let created;
    try {
      created = await prismaFlowly.caseAttachment.create({
        data: {
          caseAttachmentId: createId(),
          caseId: request.caseId,
          mediaType,
          filePath: filePath!,
          fileName: fileName!,
          fileMime,
          fileSize,
          caption: normalizeNullableText(request.caption) ?? null,
          locationDesc: normalizeNullableText(request.locationDesc) ?? null,
          orderIndex: request.orderIndex ?? 0,
          isActive: true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          createdBy: requesterId,
          updatedBy: requesterId,
        },
      });
    } catch (error) {
      if (fileFullPath) {
        await fs.unlink(fileFullPath).catch(() => undefined);
      }
      throw error;
    }

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_ATTACHMENT",
      entityId: created.caseAttachmentId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getAttachmentSnapshot(created as unknown as Record<string, unknown>),
      meta: { caseId: created.caseId },
    });

    return toCaseAttachmentResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateCaseAttachmentRequest
  ) {
    const request = Validation.validate(CaseAttachmentValidation.UPDATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseAttachment.findUnique({
      where: { caseAttachmentId: request.caseAttachmentId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case attachment not found");
    }

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      await ensureEmployeeCaseAccess(access.employeeId, existing.caseId);
    }

    const before = { ...existing } as Record<string, unknown>;
    const now = new Date();
    const mediaType = request.mediaType
      ? normalizeMediaType(request.mediaType)
      : existing.mediaType;

    let filePath = request.filePath?.trim() ?? existing.filePath;
    let fileName = request.fileName?.trim() ?? existing.fileName;
      let fileMime =
        request.fileMime !== undefined
          ? normalizeNullableText(request.fileMime) ?? null
          : existing.fileMime;
    let fileSize =
      request.fileSize !== undefined ? request.fileSize : existing.fileSize;
    let newFileFullPath: string | null = null;
    let oldFileFullPath: string | null = null;
    let oldFileRenamedPath: string | null = null;

    if (request.fileData) {
      const { base64, mime } = parseFileData(request.fileData);
      const fileBuffer = Buffer.from(base64, "base64");
      if (!fileBuffer.length) {
        throw new ResponseError(400, "Attachment file tidak valid");
      }
      if (fileBuffer.length > MAX_ATTACHMENT_SIZE) {
        throw new ResponseError(400, "Ukuran file terlalu besar");
      }
      const isImage = mime.toLowerCase().startsWith("image/");
      const isVideo = mime.toLowerCase().startsWith("video/");
      if (!isImage && !isVideo) {
        throw new ResponseError(400, "File harus berupa gambar atau video");
      }

      const inferredType = isImage ? "PHOTO" : "VIDEO";
      if (mediaType !== inferredType) {
        throw new ResponseError(400, "mediaType tidak sesuai dengan file");
      }

      const ext = extensionFromMime(mime);
      const newFileName = buildCaseFileName(existing.caseId, mediaType, now, ext);
      const newFilePath = `/assets/case/${newFileName}`;
      newFileFullPath = path.join(CASE_UPLOAD_DIR, newFileName);

      await fs.mkdir(CASE_UPLOAD_DIR, { recursive: true });
      await fs.writeFile(newFileFullPath, fileBuffer);

      fileName = newFileName;
      filePath = newFilePath;
      fileMime = mime;
      fileSize = fileBuffer.length;

      if (existing.fileName) {
        oldFileFullPath = path.join(CASE_UPLOAD_DIR, existing.fileName);
        const deletedFileName = buildDeletedFileName(existing.fileName, now);
        oldFileRenamedPath = path.join(CASE_UPLOAD_DIR, deletedFileName);
      }
    }

      const nextCaption =
        request.caption !== undefined
          ? normalizeNullableText(request.caption) ?? null
          : existing.caption;
      const nextLocationDesc =
        request.locationDesc !== undefined
          ? normalizeNullableText(request.locationDesc) ?? null
          : existing.locationDesc;

      const updateData: Prisma.CaseAttachmentUpdateInput = {
        mediaType,
        filePath,
        fileName,
        fileMime,
        fileSize,
        caption: nextCaption,
        locationDesc: nextLocationDesc,
        orderIndex: request.orderIndex ?? existing.orderIndex,
        isActive: request.isActive ?? existing.isActive,
        updatedAt: now,
        updatedBy: requesterId,
    };

    let updated;
    try {
      updated = await prismaFlowly.caseAttachment.update({
        where: { caseAttachmentId: request.caseAttachmentId },
        data: updateData,
      });
    } catch (error) {
      if (newFileFullPath) {
        await fs.unlink(newFileFullPath).catch(() => undefined);
      }
      throw error;
    }

    if (oldFileFullPath && oldFileRenamedPath) {
      try {
        await fs.access(oldFileFullPath);
        await fs.rename(oldFileFullPath, oldFileRenamedPath);
      } catch {
        // Best-effort cleanup; ignore file rename failures.
      }
    }

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      CASE_ATTACHMENT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_ATTACHMENT",
        entityId: updated.caseAttachmentId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
        meta: { caseId: updated.caseId },
      });
    }

    return toCaseAttachmentResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseAttachmentRequest
  ) {
    const request = Validation.validate(CaseAttachmentValidation.DELETE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseAttachment.findUnique({
      where: { caseAttachmentId: request.caseAttachmentId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case attachment not found");
    }

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      await ensureEmployeeCaseAccess(access.employeeId, existing.caseId);
    }

    const now = new Date();
    const updated = await prismaFlowly.caseAttachment.update({
      where: { caseAttachmentId: request.caseAttachmentId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: now,
        deletedBy: requesterId,
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_ATTACHMENT",
      entityId: updated.caseAttachmentId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getAttachmentSnapshot(updated as unknown as Record<string, unknown>),
      meta: { caseId: updated.caseId },
    });

    return { message: "Case attachment deleted" };
  }

  static async list(
    requesterId: string,
    filters?: { caseId?: string }
  ) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    if (access.actorType === "EMPLOYEE" && access.employeeId) {
      if (!filters?.caseId) {
        return [];
      }
      await ensureEmployeeCaseReadAccess(access.employeeId, filters.caseId);
    }

    const whereClause: Prisma.CaseAttachmentWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
    };

    const list = await prismaFlowly.caseAttachment.findMany({
      where: whereClause,
      orderBy: { orderIndex: "asc" },
    });

    return list.map(toCaseAttachmentListResponse);
  }

  static async getFile(requesterId: string, caseAttachmentId: string) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    const attachment = await prismaFlowly.caseAttachment.findUnique({
      where: { caseAttachmentId },
      select: {
        caseAttachmentId: true,
        caseId: true,
        fileName: true,
        fileMime: true,
        isDeleted: true,
      },
    });

    if (!attachment || attachment.isDeleted) {
      throw new ResponseError(404, "Case attachment not found");
    }

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      await ensureEmployeeCaseReadAccess(access.employeeId, attachment.caseId);
    }

    const fileFullPath = path.join(CASE_UPLOAD_DIR, attachment.fileName);
    try {
      await fs.access(fileFullPath);
    } catch {
      throw new ResponseError(404, "File not found");
    }

    return {
      fullPath: fileFullPath,
      fileName: attachment.fileName,
      fileMime:
        attachment.fileMime ??
        mimeFromFileName(attachment.fileName) ??
        "application/octet-stream",
    };
  }
}
