import fs from "fs/promises";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";

const ONBOARDING_MATERIAL_DIR = path.resolve(
  process.cwd(),
  "public",
  "assets",
  "onboarding-materials"
);
const FALLBACK_PREVIEW_URL = "https://heyzine.com/flip-book/249b55c9bf.html";

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

export class OnboardingMaterialController {
  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      verifyToken(token);

      const fileName = normalizeFileName(String(req.params.fileName ?? ""));
      const fullPath = path.join(ONBOARDING_MATERIAL_DIR, fileName);

      try {
        await fs.access(fullPath);
      } catch {
        res.redirect(302, FALLBACK_PREVIEW_URL);
        return;
      }

      res.setHeader("Content-Type", resolveMimeType(fileName));
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      res.sendFile(fullPath);
    } catch (err) {
      next(err);
    }
  }
}
