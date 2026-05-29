import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../application/logging.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "../service/onboarding-material-service.js";
import { OnboardingService } from "../service/onboarding-service.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { SupplierSsoService } from "../service/supplier-sso-service.js";
import { OnboardingStageService } from "../service/onboarding-stage-service.js";
import { getAccessContext } from "../utils/access-scope.js";

const ONBOARDING_MATERIAL_DOCUMENT_DIR = path.normalize(
  process.env.ONBOARDING_SOURCE_MATERIAL_DOCUMENT_DIR ??
    process.env.ONBOARDING_SOURCE_MATERIAL_DIR ??
    "Z:\\jobqualify\\ci3\\uploads\\materi\\dokumen"
);
const ONBOARDING_MATERIAL_VIDEO_DIR = path.normalize(
  process.env.ONBOARDING_SOURCE_MATERIAL_VIDEO_DIR ??
    "Z:\\jobqualify\\ci3\\uploads\\materi\\video"
);
const ONBOARDING_MATERIAL_IMAGE_DIR = path.normalize(
  process.env.ONBOARDING_SOURCE_MATERIAL_IMAGE_DIR ??
    "Z:\\jobqualify\\ci3\\uploads\\materi\\qrcode"
);
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".webp",
  ".svg",
  ".avif",
  ".jfif",
]);

const normalizeFileName = (value: string) => {
  const fileName = path.basename(value.trim());
  if (!fileName || !/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    throw new ResponseError(400, "Nama file onboarding tidak valid");
  }
  return fileName;
};

const resolveMimeType = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
    case ".jfif":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".avi":
      return "video/x-msvideo";
    case ".webm":
      return "video/webm";
    case ".pdf":
      return "application/pdf";
    case ".ppt":
      return "application/vnd.ms-powerpoint";
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
};

const resolveSourceDirectory = (fileName: string, fileType: number | null) => {
  const ext = path.extname(fileName).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) {
    return ONBOARDING_MATERIAL_IMAGE_DIR;
  }

  return fileType === 1
    ? ONBOARDING_MATERIAL_VIDEO_DIR
    : ONBOARDING_MATERIAL_DOCUMENT_DIR;
};

const toLogMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

const collectLocalFileDiagnostics = async (
  sourceDirectory: string,
  fullPath: string
) => {
  const diagnostics: Record<string, unknown> = {
    sourceDirectory,
    filePath: fullPath,
    cwd: process.cwd(),
    documentDir: ONBOARDING_MATERIAL_DOCUMENT_DIR,
    videoDir: ONBOARDING_MATERIAL_VIDEO_DIR,
    imageDir: ONBOARDING_MATERIAL_IMAGE_DIR,
  };

  try {
    await fs.access(sourceDirectory);
    diagnostics.sourceDirectoryAccessible = true;
  } catch (err) {
    diagnostics.sourceDirectoryAccessible = false;
    diagnostics.sourceDirectoryError = toLogMessage(err);
    return diagnostics;
  }

  try {
    const targetName = path.basename(fullPath).toLowerCase();
    const targetPrefix = targetName.slice(0, Math.min(targetName.length, 24));
    const matches = (await fs.readdir(sourceDirectory))
      .filter((entry) => {
        const normalizedEntry = entry.toLowerCase();
        return (
          normalizedEntry === targetName ||
          (targetPrefix.length > 0 && normalizedEntry.includes(targetPrefix))
        );
      })
      .slice(0, 10);
    diagnostics.matchingFileNames = matches;
  } catch (err) {
    diagnostics.directoryListError = toLogMessage(err);
  }

  return diagnostics;
};

const normalizeQueryText = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
};

const resolvePortalKey = (req: Request, fallback: "CUSTOMER" | "SUPPLIER" = "CUSTOMER") => {
  const portalKey = normalizeQueryText(req.query.portalKey)?.toUpperCase() ?? fallback;
  if (portalKey !== "CUSTOMER" && portalKey !== "SUPPLIER") {
    throw new ResponseError(400, "Portal learning tidak valid");
  }
  return portalKey;
};

const parseMaterialReadTrackingRequest = (
  req: Request,
  fileName: string
) => {
  const onboardingAssignmentId = normalizeQueryText(req.query.onboardingAssignmentId);
  const onboardingStageProgressId = normalizeQueryText(
    req.query.onboardingStageProgressId
  );
  const onboardingStageMaterialId = normalizeQueryText(
    req.query.onboardingStageMaterialId
  );

  if (
    !onboardingAssignmentId ||
    !onboardingStageProgressId ||
    !onboardingStageMaterialId
  ) {
    return null;
  }

  const sourceFileIdValue = Number(req.query.sourceFileId);
  const sourceFileId = Number.isInteger(sourceFileIdValue)
    ? sourceFileIdValue
    : 0;

  return {
    onboardingAssignmentId,
    onboardingStageProgressId,
    onboardingStageMaterialId,
    sourceFileId,
    fileName,
    fileTitle: normalizeQueryText(req.query.fileTitle),
  };
};

const resolveCustomerLearningAccess = async (req: Request) => {
  const portalKey = resolvePortalKey(req);
  const token = req.cookies.access_token;
  if (token) {
    try {
      const payload = verifyToken(token);
      const accessContext = await getAccessContext(payload.userId);
      if (accessContext.isAdmin) {
        return {
          portalKey,
          bypassProgramFilter: true,
          custId: null,
          participantReferenceId: null,
          participantReferenceType: portalKey,
          canDownloadOriginal: true,
        };
      }
      if (portalKey === "SUPPLIER") {
        return {
          portalKey,
          bypassProgramFilter: false,
          custId: null,
          participantReferenceId: payload.userId,
          participantReferenceType: "SUPPLIER",
          canDownloadOriginal: false,
        };
      }
      return {
        portalKey,
        bypassProgramFilter: true,
        custId: null,
        participantReferenceId: null,
        participantReferenceType: portalKey,
        canDownloadOriginal: false,
      };
    } catch {
      // Fall through to customer session support.
    }
  }

  const customerToken = req.cookies?.customer_access_token;
  if (portalKey === "CUSTOMER" && customerToken) {
    try {
      const profile = CustomerSsoService.getProfile(customerToken);
      return {
        portalKey,
        bypassProgramFilter: false,
        custId: profile.custid,
        participantReferenceId: profile.custid,
        participantReferenceType: "CUSTOMER",
        canDownloadOriginal: false,
      };
    } catch {
      // Fall through to unauthorized handling.
    }
  }

  const supplierToken = req.cookies?.supplier_access_token;
  if (portalKey === "SUPPLIER" && supplierToken) {
    try {
      const profile = SupplierSsoService.getProfile(supplierToken);
      return {
        portalKey,
        bypassProgramFilter: false,
        custId: null,
        participantReferenceId: profile.supplierId,
        participantReferenceType: "SUPPLIER",
        canDownloadOriginal: false,
      };
    } catch {
      // Fall through to unauthorized handling.
    }
  }

  if (!token) {
    throw new ResponseError(401, "Unauthorized");
  }

  throw new ResponseError(403, "Admin access required");
};

const resolveContentDisposition = (req: Request) =>
  normalizeQueryText(req.query.disposition)?.toLowerCase() === "attachment"
    ? "attachment"
    : "inline";

const resolveCustomerLearningContentDisposition = (
  req: Request,
  access: {
    canDownloadOriginal: boolean;
  }
) => {
  const disposition = resolveContentDisposition(req);
  if (!access.canDownloadOriginal && disposition === "attachment") {
    throw new ResponseError(403, "Download materi customer tidak diizinkan");
  }

  return disposition;
};

const isHttpUrl = (value: string | null) => /^https?:\/\//i.test(value ?? "");

const streamExternalOnboardingFile = async (
  res: Response,
  params: {
    fileName: string;
    fileUrl: string;
    disposition: "inline" | "attachment";
  }
) => {
  const response = await fetch(params.fileUrl);
  if (!response.ok || !response.body) {
    throw new ResponseError(404, "File onboarding tidak ditemukan");
  }

  const sourceContentType = response.headers.get("content-type");
  const contentType =
    !sourceContentType ||
    /^application\/octet-stream\b/i.test(sourceContentType)
      ? resolveMimeType(params.fileName)
      : sourceContentType;

  res.setHeader(
    "Content-Type",
    contentType
  );
  res.setHeader(
    "Content-Disposition",
    `${params.disposition}; filename="${params.fileName}"`
  );
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  Readable.fromWeb(response.body as unknown as NodeReadableStream).pipe(res);
};

const streamLocalOnboardingFile = async (
  req: Request,
  res: Response,
  params: {
    fileName: string;
    filePath: string;
    contentType: string;
    disposition: "inline" | "attachment";
  }
) => {
  const stat = await fs.stat(params.filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader("Content-Type", params.contentType);
  res.setHeader(
    "Content-Disposition",
    `${params.disposition}; filename="${params.fileName}"`
  );
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const pipeFile = (start?: number, end?: number) => {
    const stream = createReadStream(params.filePath, {
      start,
      end,
    });
    stream.on("error", (err) => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Gagal memuat file onboarding" });
        return;
      }
      res.destroy(err);
    });
    stream.pipe(res);
  };

  if (!range) {
    res.setHeader("Content-Length", fileSize);
    pipeFile();
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    res.setHeader("Content-Range", `bytes */${fileSize}`);
    res.status(416).end();
    return;
  }

  const rawStart = match[1] ?? "";
  const rawEnd = match[2] ?? "";
  let start = rawStart ? Number(rawStart) : 0;
  let end = rawEnd ? Number(rawEnd) : fileSize - 1;

  if (!rawStart && rawEnd) {
    const suffixLength = Number(rawEnd);
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    res.setHeader("Content-Range", `bytes */${fileSize}`);
    res.status(416).end();
    return;
  }

  end = Math.min(end, fileSize - 1);
  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  res.setHeader("Content-Length", end - start + 1);
  pipeFile(start, end);
};

const sendOnboardingFile = async (
  req: Request,
  res: Response,
  params: {
    fileName: string;
    fileType: number | null;
    fileUrl?: string | null;
    disposition: "inline" | "attachment";
  }
) => {
  const fileName = normalizeFileName(params.fileName);
  const fileUrl = normalizeQueryText(params.fileUrl);
  if (fileUrl && isHttpUrl(fileUrl)) {
    await streamExternalOnboardingFile(res, {
      fileName,
      fileUrl,
      disposition: params.disposition,
    });
    return;
  }

  const sourceDirectory = resolveSourceDirectory(fileName, params.fileType);
  const fullPath = path.join(sourceDirectory, fileName);

  try {
    await fs.access(fullPath);
  } catch {
    logger.warn("Onboarding source file not found", {
      fileName,
      fileType: params.fileType,
      ...(await collectLocalFileDiagnostics(sourceDirectory, fullPath)),
    });
    throw new ResponseError(404, "File onboarding tidak ditemukan");
  }

  await streamLocalOnboardingFile(req, res, {
    fileName,
    filePath: fullPath,
    contentType: resolveMimeType(fileName),
    disposition: params.disposition,
  });
};

export class OnboardingMaterialController {
  static async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingMaterialService.listAssignments(payload.userId);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async listSourceMaterials(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      verifyToken(token);
      const response = await OnboardingMaterialService.listSourceMaterials();

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingMaterialService.createAssignment(
        payload.userId,
        req.body
      );

      res.status(201).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingMaterialService.deleteAssignment(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async recordMaterialOpen(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingService.startMaterialRead(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async downloadCustomerLearningFile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const access = await resolveCustomerLearningAccess(req);
      const fileName = normalizeQueryText(req.query.fileName);
      const fileTypeValue = Number(req.query.fileType);
      const fileType = Number.isInteger(fileTypeValue) ? fileTypeValue : null;
      const sourceFileIdValue = Number(req.query.sourceFileId);
      const sourceFileId = Number.isInteger(sourceFileIdValue)
        ? sourceFileIdValue
        : 0;
      const request = {
        ...access,
        onboardingAssignmentId: normalizeQueryText(
          req.query.onboardingAssignmentId
        ),
        onboardingStageProgressId: normalizeQueryText(
          req.query.onboardingStageProgressId
        ),
        onboardingStageMaterialId: normalizeQueryText(
          req.query.onboardingStageMaterialId
        ),
        programType: normalizeQueryText(req.query.programType),
        sourceFileId,
        fileName,
        fileTitle: normalizeQueryText(req.query.fileTitle),
      };

      const authorized =
        await OnboardingStageService.authorizeCustomerLearningFileAccess(
          request
        );

      if (!access.bypassProgramFilter && access.participantReferenceId) {
        await OnboardingStageService.recordCustomerLearningFileOpen(
          access.participantReferenceId,
          {
            portalKey: access.portalKey,
            participantReferenceType: access.participantReferenceType,
            programType: request.programType,
            onboardingAssignmentId: request.onboardingAssignmentId,
            onboardingStageProgressId: request.onboardingStageProgressId,
            onboardingStageMaterialId: request.onboardingStageMaterialId,
            sourceFileId,
            fileName: authorized.sourceFile.fileName,
            fileTitle: authorized.sourceFile.title,
          }
        );
      }

      await sendOnboardingFile(req, res, {
        fileName: authorized.sourceFile.fileName,
        fileType: authorized.sourceFile.fileType ?? fileType,
        fileUrl: authorized.sourceFile.url,
        disposition: resolveCustomerLearningContentDisposition(req, access),
      });
    } catch (err) {
      next(err);
    }
  }

  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const fileName = normalizeFileName(String(req.params.fileName ?? ""));
      const token = req.cookies.access_token;
      let requesterUserId: string | null = null;
      if (token) {
        try {
          requesterUserId = verifyToken(token).userId;
        } catch {
          requesterUserId = null;
        }
      }

      const customerToken = req.cookies?.customer_access_token;
      let hasCustomerSession = false;
      if (!requesterUserId && customerToken) {
        try {
          CustomerSsoService.getProfile(customerToken);
          hasCustomerSession = true;
        } catch {
          hasCustomerSession = false;
        }
      }

      const supplierToken = req.cookies?.supplier_access_token;
      let hasSupplierSession = false;
      if (!requesterUserId && !hasCustomerSession && supplierToken) {
        try {
          SupplierSsoService.getProfile(supplierToken);
          hasSupplierSession = true;
        } catch {
          hasSupplierSession = false;
        }
      }

      if (!requesterUserId && !hasCustomerSession && !hasSupplierSession) {
        throw new ResponseError(401, "Unauthorized");
      }

      if (!requesterUserId && (hasCustomerSession || hasSupplierSession)) {
        throw new ResponseError(403, "Gunakan link materi portal yang valid");
      }

      const authenticatedUserId = requesterUserId;
      if (!authenticatedUserId) {
        throw new ResponseError(401, "Unauthorized");
      }

      const fileTypeValue = Number(req.query.fileType);
      const fileType = Number.isInteger(fileTypeValue) ? fileTypeValue : null;
      const disposition = resolveContentDisposition(req);
      const trackingRequest = parseMaterialReadTrackingRequest(req, fileName);
      const accessContext = await getAccessContext(authenticatedUserId);

      if (!trackingRequest && !accessContext.isAdmin) {
        throw new ResponseError(403, "Gunakan link materi onboarding yang valid");
      }

      if (disposition === "attachment" && !accessContext.isAdmin) {
        throw new ResponseError(403, "Download file asli hanya untuk admin");
      }
      let resolvedFileName = fileName;
      let resolvedFileType = fileType;
      let resolvedFileUrl: string | null = null;

      if (trackingRequest) {
        const materialRead = await OnboardingService.startMaterialRead(
          authenticatedUserId,
          trackingRequest
        );
        resolvedFileName = materialRead.fileName ?? fileName;
        resolvedFileType = materialRead.fileType ?? fileType;
        resolvedFileUrl = materialRead.fileUrl;
      }

      await sendOnboardingFile(req, res, {
        fileName: resolvedFileName,
        fileType: resolvedFileType,
        fileUrl: resolvedFileUrl,
        disposition,
      });
    } catch (err) {
      next(err);
    }
  }
}
