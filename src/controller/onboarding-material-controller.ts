import fs from "fs/promises";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "../service/onboarding-material-service.js";
import { OnboardingService } from "../service/onboarding-service.js";

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

  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const fileName = normalizeFileName(String(req.params.fileName ?? ""));
      const payload = verifyToken(token);
      const fileTypeValue = Number(req.query.fileType);
      const fileType = Number.isInteger(fileTypeValue) ? fileTypeValue : null;
      const trackingRequest = parseMaterialReadTrackingRequest(req, fileName);
      const fullPath = path.join(resolveSourceDirectory(fileName, fileType), fileName);

      try {
        await fs.access(fullPath);
      } catch {
        res.redirect(302, FALLBACK_PREVIEW_URL);
        return;
      }

      if (trackingRequest) {
        await OnboardingService.startMaterialRead(payload.userId, trackingRequest);
      }

      res.setHeader("Content-Type", resolveMimeType(fileName));
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      res.sendFile(fullPath);
    } catch (err) {
      next(err);
    }
  }
}
