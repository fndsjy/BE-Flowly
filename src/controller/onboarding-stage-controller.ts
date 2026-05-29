import type { NextFunction, Request, Response } from "express";
import { ResponseError } from "../error/response-error.js";
import { OnboardingStageService } from "../service/onboarding-stage-service.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { SupplierSsoService } from "../service/supplier-sso-service.js";
import { getAccessContext } from "../utils/access-scope.js";
import { verifyToken } from "../utils/auth.js";

const normalizeQueryText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const resolvePortalKey = (req: Request, fallback: "CUSTOMER" | "SUPPLIER") => {
  const portalKey = normalizeQueryText(req.query.portalKey)?.toUpperCase() ?? fallback;
  if (portalKey !== "CUSTOMER" && portalKey !== "SUPPLIER") {
    throw new ResponseError(400, "Portal learning tidak valid");
  }
  return portalKey;
};

const ensurePortalLearningAccess = async (
  req: Request,
  fallbackPortalKey: "CUSTOMER" | "SUPPLIER" = "CUSTOMER"
) => {
  const portalKey = resolvePortalKey(req, fallbackPortalKey);
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
      // Fall through to normal OMS session support.
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
      // Fall through to normal OMS session support.
    }
  }

  if (!token) {
    throw new ResponseError(401, "Unauthorized");
  }

  throw new ResponseError(403, "Admin access required");
};

const untrackedLearningOpenResponse = {
  tracked: false,
  onboardingMaterialProgressId: null,
  onboardingAssignmentId: null,
  onboardingStageProgressId: null,
  onboardingStageMaterialId: null,
  sourceFileId: null,
  status: null,
  stageStatus: null,
  readAt: null,
  lastReadAt: null,
  openCount: 0,
};

export class OnboardingStageController {
  static async listCustomerLearning(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const access = await ensurePortalLearningAccess(req, "CUSTOMER");
      const response = await OnboardingStageService.listCustomerLearningStages(
        {
          ...access,
          programType: normalizeQueryText(req.query.programType),
        }
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async listPortalLearning(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const access = await ensurePortalLearningAccess(req, "CUSTOMER");
      const response = await OnboardingStageService.listCustomerLearningStages({
        ...access,
        programType: normalizeQueryText(req.query.programType),
      });

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async recordCustomerLearningFileOpen(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const access = await ensurePortalLearningAccess(req, "CUSTOMER");
      if (access.bypassProgramFilter || !access.participantReferenceId) {
        res.status(200).json({ response: untrackedLearningOpenResponse });
        return;
      }

      const response =
        await OnboardingStageService.recordCustomerLearningFileOpen(
          access.participantReferenceId,
          {
            ...req.body,
            portalKey: access.portalKey,
            participantReferenceType: access.participantReferenceType,
          }
        );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async recordPortalLearningFileOpen(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const access = await ensurePortalLearningAccess(req, "CUSTOMER");
      if (access.bypassProgramFilter || !access.participantReferenceId) {
        res.status(200).json({ response: untrackedLearningOpenResponse });
        return;
      }

      const response =
        await OnboardingStageService.recordCustomerLearningFileOpen(
          access.participantReferenceId,
          {
            ...req.body,
            portalKey: access.portalKey,
            participantReferenceType: access.participantReferenceType,
          }
        );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingStageService.list(payload.userId);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingStageService.create(
        payload.userId,
        req.body
      );

      res.status(201).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingStageService.update(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingStageService.delete(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
