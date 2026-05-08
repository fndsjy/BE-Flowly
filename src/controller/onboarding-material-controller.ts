import { execFile } from "child_process";
import { createHash, randomUUID } from "crypto";
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { promisify } from "util";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../application/logging.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "../service/onboarding-material-service.js";
import { OnboardingService } from "../service/onboarding-service.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { OnboardingStageService } from "../service/onboarding-stage-service.js";
import { getAccessContext } from "../utils/access-scope.js";

const execFileAsync = promisify(execFile);
const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
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
const ONBOARDING_PREVIEW_CACHE_DIR = path.resolve(
  process.env.ONBOARDING_PREVIEW_CACHE_DIR ??
    path.join(process.cwd(), ".cache", "onboarding-preview")
);
const ONBOARDING_PREVIEW_WORK_DIR = path.join(
  ONBOARDING_PREVIEW_CACHE_DIR,
  "work"
);
const OFFICE_TO_PDF_CONVERTER = path.resolve(
  process.env.OFFICE_TO_PDF_CONVERTER ??
    path.join(process.cwd(), "scripts", "convert-office-to-pdf.ps1")
);
const OFFICE_TO_PDF_TIMEOUT_MS = parsePositiveInteger(
  process.env.ONBOARDING_OFFICE_TO_PDF_TIMEOUT_MS,
  120_000
);
const OFFICE_SOURCE_MAX_BYTES = parsePositiveInteger(
  process.env.ONBOARDING_PREVIEW_SOURCE_MAX_BYTES,
  75 * 1024 * 1024
);
const POWERSHELL_BIN = process.env.POWERSHELL_BIN ?? "powershell.exe";
const OFFICE_AUTOMATION_CLEANUP_SCRIPT = `
$names = @('WINWORD.EXE', 'POWERPNT.EXE', 'EXCEL.EXE')
Get-CimInstance Win32_Process |
  Where-Object {
    $names -contains $_.Name -and
    ($_.CommandLine -match '(-Embedding|/Automation)')
  } |
  ForEach-Object {
    Invoke-CimMethod -InputObject $_ -MethodName Terminate | Out-Null
  }
`;
const FALLBACK_PREVIEW_URL = "https://heyzine.com/flip-book/249b55c9bf.html";
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
const OFFICE_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".odt",
  ".odp",
  ".ods",
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

const isOfficeFile = (fileName: string) =>
  OFFICE_EXTENSIONS.has(path.extname(fileName).toLowerCase());

const normalizeQueryText = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
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
  const token = req.cookies.access_token;
  if (token) {
    try {
      const payload = verifyToken(token);
      const accessContext = await getAccessContext(payload.userId);
      if (accessContext.isAdmin) {
        return {
          bypassProgramFilter: true,
          custId: null,
        };
      }
    } catch {
      // Fall through to customer session support.
    }
  }

  const customerToken = req.cookies?.customer_access_token;
  if (customerToken) {
    try {
      return {
        bypassProgramFilter: false,
        custId: CustomerSsoService.getProfile(customerToken).custid,
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
    bypassProgramFilter: boolean;
  }
) => {
  const disposition = resolveContentDisposition(req);
  if (!access.bypassProgramFilter && disposition === "attachment") {
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

const toPdfFileName = (fileName: string) =>
  `${path.basename(fileName, path.extname(fileName))}.pdf`;

const resolveLocalOnboardingFilePath = async (
  fileName: string,
  fileType: number | null
) => {
  const fullPath = path.join(resolveSourceDirectory(fileName, fileType), fileName);
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
    return null;
  }
};

const sendLocalPdfPreview = async (
  req: Request,
  res: Response,
  params: {
    fileName: string;
    filePath: string;
  }
) => {
  await streamLocalOnboardingFile(req, res, {
    fileName: params.fileName,
    filePath: params.filePath,
    contentType: "application/pdf",
    disposition: "inline",
  });
};

const ensureOfficePreviewConverter = async () => {
  try {
    await fs.access(OFFICE_TO_PDF_CONVERTER);
  } catch {
    throw new ResponseError(
      501,
      "Preview Office belum tersedia: converter PDF belum dikonfigurasi di server"
    );
  }
};

const cleanupOfficeAutomationProcesses = async () => {
  try {
    await execFileAsync(
      POWERSHELL_BIN,
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        OFFICE_AUTOMATION_CLEANUP_SCRIPT,
      ],
      {
        maxBuffer: 1024 * 1024,
        timeout: 10_000,
        windowsHide: true,
      }
    );
  } catch (err) {
    const error = err as Error;
    logger.warn("Failed to cleanup Office automation processes", {
      message: error.message,
    });
  }
};

const handleOfficePreviewConversionError = async (err: unknown) => {
  if (err instanceof ResponseError) {
    throw err;
  }

  const error = err as NodeJS.ErrnoException & {
    stderr?: string | Buffer;
    stdout?: string | Buffer;
    killed?: boolean;
    signal?: string | null;
  };
  const stderr = String(error.stderr ?? "");
  const stdout = String(error.stdout ?? "");
  const message = [error.message, stderr, stdout].filter(Boolean).join("\n");

  logger.warn("Office preview PDF conversion failed", {
    message: error.message,
    stderr,
    stdout,
    killed: error.killed,
    signal: error.signal,
  });

  if (error.killed || /timed out/i.test(error.message ?? "")) {
    await cleanupOfficeAutomationProcesses();
    throw new ResponseError(
      504,
      "Gagal membuat preview PDF materi Office: proses konversi terlalu lama"
    );
  }

  if (
    /class not registered|invalid class string|cannot create activex|retrieving the com class factory|new-object.*comobject|microsoft office/i.test(
      message
    )
  ) {
    throw new ResponseError(
      501,
      "Preview Office belum tersedia: Microsoft Office belum siap di server"
    );
  }

  throw new ResponseError(500, "Gagal membuat preview PDF materi Office");
};

const convertOfficeToPdf = async (params: {
  sourcePath: string;
  outputPath: string;
}) => {
  await ensureOfficePreviewConverter();
  await fs.mkdir(path.dirname(params.outputPath), { recursive: true });

  try {
    await execFileAsync(
      POWERSHELL_BIN,
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        OFFICE_TO_PDF_CONVERTER,
        "-InputPath",
        params.sourcePath,
        "-OutputPath",
        params.outputPath,
      ],
      {
        maxBuffer: 1024 * 1024,
        timeout: OFFICE_TO_PDF_TIMEOUT_MS,
        windowsHide: true,
      }
    );
  } catch (err) {
    await handleOfficePreviewConversionError(err);
  }

  try {
    await fs.access(params.outputPath);
  } catch {
    throw new ResponseError(500, "Gagal membuat preview PDF materi Office");
  }
};

const buildLocalOfficePreviewCacheKey = async (sourcePath: string) => {
  const stat = await fs.stat(sourcePath);
  return createHash("sha256")
    .update(path.resolve(sourcePath).toLowerCase())
    .update(String(stat.size))
    .update(String(stat.mtimeMs))
    .digest("hex");
};

const buildOfficePreviewCacheFile = (cacheKey: string, fileName: string) => ({
  fileName: toPdfFileName(fileName),
  filePath: path.join(
    ONBOARDING_PREVIEW_CACHE_DIR,
    cacheKey,
    toPdfFileName(fileName)
  ),
});

const ensureConvertedLocalOfficePreview = async (params: {
  sourcePath: string;
  fileName: string;
}) => {
  const cacheKey = await buildLocalOfficePreviewCacheKey(params.sourcePath);
  const cacheFile = buildOfficePreviewCacheFile(cacheKey, params.fileName);

  try {
    await fs.access(cacheFile.filePath);
    return cacheFile;
  } catch {
    // Create the preview below.
  }

  await convertOfficeToPdf({
    sourcePath: params.sourcePath,
    outputPath: cacheFile.filePath,
  });
  return cacheFile;
};

const downloadExternalOfficeSource = async (params: {
  fileName: string;
  fileUrl: string;
}) => {
  const response = await fetch(params.fileUrl);
  if (!response.ok || !response.body) {
    throw new ResponseError(404, "File onboarding tidak ditemukan");
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > OFFICE_SOURCE_MAX_BYTES) {
    throw new ResponseError(
      413,
      "File Office terlalu besar untuk dibuat preview"
    );
  }

  const workDir = path.join(ONBOARDING_PREVIEW_WORK_DIR, randomUUID());
  const sourcePath = path.join(workDir, params.fileName);
  await fs.mkdir(workDir, { recursive: true });

  try {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const stream = Readable.fromWeb(
      response.body as unknown as NodeReadableStream
    );
    for await (const chunk of stream) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;
      if (totalBytes > OFFICE_SOURCE_MAX_BYTES) {
        throw new ResponseError(
          413,
          "File Office terlalu besar untuk dibuat preview"
        );
      }
      chunks.push(buffer);
    }

    await fs.writeFile(sourcePath, Buffer.concat(chunks));
    return {
      sourcePath,
      cleanup: () => fs.rm(workDir, { recursive: true, force: true }),
    };
  } catch (err) {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    throw err;
  }
};

const ensureConvertedExternalOfficePreview = async (params: {
  fileName: string;
  fileUrl: string;
}) => {
  const cacheKey = createHash("sha256")
    .update(params.fileUrl)
    .update(params.fileName)
    .digest("hex");
  const cacheFile = buildOfficePreviewCacheFile(cacheKey, params.fileName);

  try {
    await fs.access(cacheFile.filePath);
    return cacheFile;
  } catch {
    // Download and convert the source below.
  }

  const source = await downloadExternalOfficeSource(params);
  try {
    await convertOfficeToPdf({
      sourcePath: source.sourcePath,
      outputPath: cacheFile.filePath,
    });
    return cacheFile;
  } finally {
    await source.cleanup().catch(() => undefined);
  }
};

const resolveConvertedOfficePdfPreview = async (params: {
  fileName: string;
  fileType: number | null;
  fileUrl?: string | null;
}) => {
  const localSourcePath = await resolveLocalOnboardingFilePath(
    params.fileName,
    params.fileType
  );
  if (localSourcePath) {
    return ensureConvertedLocalOfficePreview({
      sourcePath: localSourcePath,
      fileName: params.fileName,
    });
  }

  const fileUrl = normalizeQueryText(params.fileUrl);
  if (fileUrl && isHttpUrl(fileUrl)) {
    return ensureConvertedExternalOfficePreview({
      fileName: params.fileName,
      fileUrl,
    });
  }

  return null;
};

const buildPdfPreviewUrl = (fileUrl: string | null) => {
  if (!fileUrl || !isHttpUrl(fileUrl)) {
    return null;
  }

  try {
    const url = new URL(fileUrl);
    if (!/\.[^/.]+$/.test(url.pathname)) {
      return null;
    }

    url.pathname = url.pathname.replace(/\.[^/.]+$/, ".pdf");
    return url.toString();
  } catch {
    return null;
  }
};

const resolvePreparedOfficePdfPreview = async (params: {
  fileName: string;
  fileType: number | null;
  fileUrl?: string | null;
}) => {
  const pdfFileName = toPdfFileName(params.fileName);
  const localPdfPath = await resolveLocalOnboardingFilePath(
    pdfFileName,
    params.fileType
  );
  if (localPdfPath) {
    return {
      kind: "local" as const,
      fileName: pdfFileName,
      filePath: localPdfPath,
    };
  }

  const pdfUrl = buildPdfPreviewUrl(params.fileUrl ?? null);
  if (pdfUrl) {
    return {
      kind: "external" as const,
      fileName: pdfFileName,
      fileUrl: pdfUrl,
    };
  }

  return null;
};

const sendOfficePdfPreview = async (
  req: Request,
  res: Response,
  params: {
    fileName: string;
    fileType: number | null;
    fileUrl?: string | null;
  }
) => {
  const sourceFileName = normalizeFileName(params.fileName);
  const preparedPdf = await resolvePreparedOfficePdfPreview({
    fileName: sourceFileName,
    fileType: params.fileType,
    fileUrl: params.fileUrl ?? null,
  });
  if (preparedPdf?.kind === "local") {
    await sendLocalPdfPreview(req, res, {
      fileName: preparedPdf.fileName,
      filePath: preparedPdf.filePath,
    });
    return;
  }

  if (preparedPdf?.kind === "external") {
    try {
      await streamExternalOnboardingFile(res, {
        fileName: preparedPdf.fileName,
        fileUrl: preparedPdf.fileUrl,
        disposition: "inline",
      });
      return;
    } catch (err) {
      if (!(err instanceof ResponseError && err.status === 404)) {
        throw err;
      }
    }
  }

  const convertedPdf = await resolveConvertedOfficePdfPreview({
    fileName: sourceFileName,
    fileType: params.fileType,
    fileUrl: params.fileUrl ?? null,
  });
  if (convertedPdf) {
    await sendLocalPdfPreview(req, res, convertedPdf);
    return;
  }

  throw new ResponseError(404, "File onboarding tidak ditemukan");
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
  if (params.disposition === "inline" && isOfficeFile(fileName)) {
    await sendOfficePdfPreview(req, res, {
      fileName,
      fileType: params.fileType,
      fileUrl: params.fileUrl ?? null,
    });
    return;
  }

  if (fileUrl && isHttpUrl(fileUrl)) {
    await streamExternalOnboardingFile(res, {
      fileName,
      fileUrl,
      disposition: params.disposition,
    });
    return;
  }

  const fullPath = path.join(
    resolveSourceDirectory(fileName, params.fileType),
    fileName
  );

  try {
    await fs.access(fullPath);
  } catch {
    res.redirect(302, FALLBACK_PREVIEW_URL);
    return;
  }

  res.setHeader("Content-Type", resolveMimeType(fileName));
  res.setHeader(
    "Content-Disposition",
    `${params.disposition}; filename="${fileName}"`
  );
  res.sendFile(fullPath);
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
        sourceFileId,
        fileName,
        fileTitle: normalizeQueryText(req.query.fileTitle),
      };

      const authorized =
        await OnboardingStageService.authorizeCustomerLearningFileAccess(
          request
        );

      if (!access.bypassProgramFilter && access.custId) {
        await OnboardingStageService.recordCustomerLearningFileOpen(
          access.custId,
          {
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

      if (!requesterUserId && !hasCustomerSession) {
        throw new ResponseError(401, "Unauthorized");
      }

      if (!requesterUserId && hasCustomerSession) {
        throw new ResponseError(403, "Gunakan link materi customer yang valid");
      }

      const fileTypeValue = Number(req.query.fileType);
      const fileType = Number.isInteger(fileTypeValue) ? fileTypeValue : null;
      const disposition = resolveContentDisposition(req);
      if (disposition === "attachment" && requesterUserId) {
        const accessContext = await getAccessContext(requesterUserId);
        if (!accessContext.isAdmin) {
          throw new ResponseError(403, "Download file asli hanya untuk admin");
        }
      }
      const trackingRequest = parseMaterialReadTrackingRequest(req, fileName);
      let resolvedFileName = fileName;
      let resolvedFileType = fileType;
      let resolvedFileUrl: string | null = null;

      if (trackingRequest && requesterUserId) {
        const materialRead = await OnboardingService.startMaterialRead(
          requesterUserId,
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
