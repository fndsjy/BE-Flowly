import { logger } from "../application/logging.js";
import { prismaFlowly } from "../application/database.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { verifyToken } from "../utils/auth.js";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SKIPPED_PATHS = [
    /^\/login$/i,
    /^\/logout$/i,
    /^\/customer-sso\//i,
    /^\/onboarding\/exam\/(start|answer|warning|submit)$/i,
    /^\/onboarding-stage\/customer-learning\/file-open$/i,
];
const REDACTED_KEYS = new Set([
    "access_token",
    "customer_access_token",
    "oldPassword",
    "newPassword",
    "password",
    "token",
]);
const STAGE_TEMPLATE_AUDIT_FIELDS = [
    "stageName",
    "stageDescription",
    "isActive",
    "isDeleted",
];
const STAGE_MATERIAL_AUDIT_FIELDS = [
    "onboardingStageTemplateId",
    "materiId",
    "orderIndex",
    "isRequired",
    "note",
    "isActive",
    "isDeleted",
];
const STAGE_EXAM_AUDIT_FIELDS = [
    "onboardingStageTemplateId",
    "examId",
    "passScore",
    "orderIndex",
    "note",
    "isActive",
    "isDeleted",
];
const PORTAL_LABELS = {
    ADMINISTRATOR: "Administrator",
    AFFILIATE: "Affiliate",
    COMMUNITY: "Community",
    CUSTOMER: "Customer",
    EMPLOYEE: "Employee",
    INFLUENCER: "Influencer",
    SUPPLIER: "Supplier",
};
const normalizeText = (value) => {
    if (typeof value !== "string")
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
const normalizePortalKey = (value) => {
    const text = normalizeText(value);
    return text ? text.toUpperCase() : null;
};
const portalContextFromKey = (portalKey) => ({
    portalKey,
    portalName: PORTAL_LABELS[portalKey] ?? portalKey,
});
const firstText = (value) => {
    if (Array.isArray(value)) {
        return firstText(value[0]);
    }
    return normalizeText(value);
};
const getRequestValue = (req, key) => {
    const body = req.body;
    return firstText(body?.[key] ?? req.query[key]);
};
const derivePortalFromReferrer = (req) => {
    const rawReferrer = req.get("referer") ?? req.get("referrer");
    if (!rawReferrer)
        return null;
    try {
        const pathname = new URL(rawReferrer).pathname.toLowerCase();
        if (pathname.includes("/portal-administrator") || pathname.includes("/administrator")) {
            return portalContextFromKey("ADMINISTRATOR");
        }
        if (pathname.includes("/supplier"))
            return portalContextFromKey("SUPPLIER");
        if (pathname.includes("/customer"))
            return portalContextFromKey("CUSTOMER");
        if (pathname.includes("/affiliate"))
            return portalContextFromKey("AFFILIATE");
        if (pathname.includes("/influencer"))
            return portalContextFromKey("INFLUENCER");
        if (pathname.includes("/community"))
            return portalContextFromKey("COMMUNITY");
        return portalContextFromKey("EMPLOYEE");
    }
    catch {
        return null;
    }
};
const resolvePortalFromTemplate = async (onboardingPortalTemplateId) => {
    const portal = await prismaFlowly.onboardingPortalTemplate.findUnique({
        where: { onboardingPortalTemplateId },
        select: { portalKey: true, portalName: true },
    });
    return portal
        ? { portalKey: portal.portalKey, portalName: portal.portalName }
        : null;
};
const resolvePortalFromStageTemplate = async (onboardingStageTemplateId) => {
    const stage = await prismaFlowly.onboardingStageTemplate.findUnique({
        where: { onboardingStageTemplateId },
        select: {
            portalTemplate: {
                select: { portalKey: true, portalName: true },
            },
        },
    });
    return stage?.portalTemplate
        ? {
            portalKey: stage.portalTemplate.portalKey,
            portalName: stage.portalTemplate.portalName,
        }
        : null;
};
const resolvePortalFromStageMaterial = async (onboardingStageMaterialId) => {
    const material = await prismaFlowly.onboardingStageMaterial.findUnique({
        where: { onboardingStageMaterialId },
        select: {
            stageTemplate: {
                select: {
                    portalTemplate: {
                        select: { portalKey: true, portalName: true },
                    },
                },
            },
        },
    });
    return material?.stageTemplate.portalTemplate
        ? {
            portalKey: material.stageTemplate.portalTemplate.portalKey,
            portalName: material.stageTemplate.portalTemplate.portalName,
        }
        : null;
};
const resolvePortalFromStageExam = async (onboardingStageExamId) => {
    const exam = await prismaFlowly.onboardingStageExam.findUnique({
        where: { onboardingStageExamId },
        select: {
            stageTemplate: {
                select: {
                    portalTemplate: {
                        select: { portalKey: true, portalName: true },
                    },
                },
            },
        },
    });
    return exam?.stageTemplate.portalTemplate
        ? {
            portalKey: exam.stageTemplate.portalTemplate.portalKey,
            portalName: exam.stageTemplate.portalTemplate.portalName,
        }
        : null;
};
const resolvePortalFromAssignment = async (onboardingAssignmentId) => {
    const assignment = await prismaFlowly.onboardingAssignment.findUnique({
        where: { onboardingAssignmentId },
        select: {
            portalKey: true,
            portalTemplate: {
                select: { portalName: true },
            },
        },
    });
    return assignment
        ? {
            portalKey: assignment.portalKey,
            portalName: assignment.portalTemplate?.portalName ?? assignment.portalKey,
        }
        : null;
};
const resolvePortalContext = async (req) => {
    const explicitPortalKey = normalizePortalKey(getRequestValue(req, "portalKey") ?? req.get("x-oms-portal"));
    if (explicitPortalKey) {
        return portalContextFromKey(explicitPortalKey);
    }
    const onboardingPortalTemplateId = getRequestValue(req, "onboardingPortalTemplateId");
    if (onboardingPortalTemplateId) {
        const portal = await resolvePortalFromTemplate(onboardingPortalTemplateId);
        if (portal)
            return portal;
    }
    const onboardingStageTemplateId = getRequestValue(req, "onboardingStageTemplateId");
    if (onboardingStageTemplateId) {
        const portal = await resolvePortalFromStageTemplate(onboardingStageTemplateId);
        if (portal)
            return portal;
    }
    const onboardingStageMaterialId = getRequestValue(req, "onboardingStageMaterialId");
    if (onboardingStageMaterialId) {
        const portal = await resolvePortalFromStageMaterial(onboardingStageMaterialId);
        if (portal)
            return portal;
    }
    const onboardingStageExamId = getRequestValue(req, "onboardingStageExamId");
    if (onboardingStageExamId) {
        const portal = await resolvePortalFromStageExam(onboardingStageExamId);
        if (portal)
            return portal;
    }
    const onboardingAssignmentId = getRequestValue(req, "onboardingAssignmentId");
    if (onboardingAssignmentId) {
        const portal = await resolvePortalFromAssignment(onboardingAssignmentId);
        if (portal)
            return portal;
    }
    return derivePortalFromReferrer(req) ?? portalContextFromKey("EMPLOYEE");
};
const resolveActor = (req) => {
    const token = req.cookies?.access_token;
    if (token) {
        try {
            const payload = verifyToken(token);
            return {
                actorId: payload.userId,
                actorType: resolveActorType(payload.userId),
            };
        }
        catch {
            // Fall through to customer token.
        }
    }
    const customerToken = req.cookies?.customer_access_token;
    if (customerToken) {
        try {
            const profile = CustomerSsoService.getProfile(customerToken);
            return {
                actorId: profile.custid,
                actorType: "CUSTOMER",
            };
        }
        catch {
            return null;
        }
    }
    return null;
};
const resolveAction = (method) => {
    if (method === "DELETE")
        return "DELETE";
    if (method === "PUT" || method === "PATCH")
        return "UPDATE";
    return "CREATE";
};
const sanitizeValue = (value, depth = 0) => {
    if (depth > 3)
        return "[object]";
    if (value === null || value === undefined)
        return value ?? null;
    if (value instanceof Date)
        return value.toISOString();
    if (Array.isArray(value)) {
        return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
    }
    if (typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
            key,
            REDACTED_KEYS.has(key) ? "[redacted]" : sanitizeValue(nested, depth + 1),
        ]));
    }
    if (typeof value === "string") {
        return value.length > 240 ? `${value.slice(0, 240)}...(${value.length} chars)` : value;
    }
    return value;
};
const normalizeRouteEntity = (path) => {
    const parts = path
        .split("/")
        .filter(Boolean)
        .slice(0, 2);
    const entity = (parts.length > 0 ? parts.join("_") : "API")
        .replace(/-/g, "_")
        .toUpperCase();
    return entity.slice(0, 50);
};
const extractEntityId = (req, responseBody) => {
    const candidates = [];
    const body = req.body;
    const response = responseBody?.response;
    if (response && typeof response === "object") {
        candidates.push(...Object.values(response));
    }
    if (body && typeof body === "object") {
        candidates.push(...Object.values(body));
    }
    const id = candidates.find((value) => {
        if (typeof value !== "string" && typeof value !== "number")
            return false;
        const text = String(value).trim();
        return /^[A-Z]+[0-9]{6,}-[0-9]+$/i.test(text) || /^[A-Z_]*\d+$/i.test(text);
    });
    return id ? String(id).slice(0, 50) : `${req.method} ${req.path}`.slice(0, 50);
};
const normalizeComparableValue = (value) => {
    if (value === undefined)
        return null;
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === "string")
        return value.trim();
    return value;
};
const buildChangesFromBefore = (beforeSnapshot, requestBody, method) => {
    if (!beforeSnapshot) {
        return undefined;
    }
    if (method === "DELETE") {
        const deleteChanges = [];
        if (Object.prototype.hasOwnProperty.call(beforeSnapshot.record, "isActive")) {
            deleteChanges.push({
                field: "isActive",
                from: normalizeComparableValue(beforeSnapshot.record.isActive),
                to: false,
            });
        }
        if (Object.prototype.hasOwnProperty.call(beforeSnapshot.record, "isDeleted")) {
            deleteChanges.push({
                field: "isDeleted",
                from: normalizeComparableValue(beforeSnapshot.record.isDeleted),
                to: true,
            });
        }
        return deleteChanges.length > 0 ? deleteChanges : undefined;
    }
    if (!requestBody || typeof requestBody !== "object") {
        return undefined;
    }
    const body = requestBody;
    const changes = beforeSnapshot.fields
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
        .map((field) => ({
        field,
        from: normalizeComparableValue(beforeSnapshot.record[field]),
        to: normalizeComparableValue(body[field]),
    }))
        .filter((change) => JSON.stringify(change.from) !== JSON.stringify(change.to));
    return changes.length > 0 ? changes : undefined;
};
const captureBeforeSnapshot = async (req) => {
    const method = req.method.toUpperCase();
    if (method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
        return null;
    }
    const path = req.path.toLowerCase();
    if (path === "/onboarding-stage") {
        const onboardingStageTemplateId = getRequestValue(req, "onboardingStageTemplateId");
        if (!onboardingStageTemplateId)
            return null;
        const record = await prismaFlowly.onboardingStageTemplate.findUnique({
            where: { onboardingStageTemplateId },
            select: {
                stageName: true,
                stageDescription: true,
                isActive: true,
                isDeleted: true,
            },
        });
        return record
            ? {
                record,
                fields: STAGE_TEMPLATE_AUDIT_FIELDS,
            }
            : null;
    }
    if (path === "/onboarding-material/assignments") {
        const onboardingStageMaterialId = getRequestValue(req, "onboardingStageMaterialId");
        if (!onboardingStageMaterialId)
            return null;
        const record = await prismaFlowly.onboardingStageMaterial.findUnique({
            where: { onboardingStageMaterialId },
            select: {
                onboardingStageTemplateId: true,
                materiId: true,
                orderIndex: true,
                isRequired: true,
                note: true,
                isActive: true,
                isDeleted: true,
            },
        });
        return record
            ? {
                record,
                fields: STAGE_MATERIAL_AUDIT_FIELDS,
            }
            : null;
    }
    if (path === "/onboarding-exam/assignments" ||
        path === "/onboarding-exam/stage-pass-score" ||
        path === "/onboarding-exam/stage-type-order") {
        const onboardingStageExamId = getRequestValue(req, "onboardingStageExamId");
        if (!onboardingStageExamId)
            return null;
        const record = await prismaFlowly.onboardingStageExam.findUnique({
            where: { onboardingStageExamId },
            select: {
                onboardingStageTemplateId: true,
                examId: true,
                passScore: true,
                orderIndex: true,
                note: true,
                isActive: true,
                isDeleted: true,
            },
        });
        return record
            ? {
                record,
                fields: STAGE_EXAM_AUDIT_FIELDS,
            }
            : null;
    }
    return null;
};
const shouldAuditRequest = (req) => MUTATION_METHODS.has(req.method.toUpperCase()) &&
    !SKIPPED_PATHS.some((pattern) => pattern.test(req.path));
const writePortalMutationAudit = async (req, responseBody, statusCode, beforeSnapshot) => {
    if (statusCode < 200 || statusCode >= 400)
        return;
    const actor = resolveActor(req);
    if (!actor?.actorId)
        return;
    const portal = await resolvePortalContext(req);
    const entity = normalizeRouteEntity(req.path);
    const method = req.method.toUpperCase();
    const changes = buildChangesFromBefore(beforeSnapshot, req.body, method);
    await writeAuditLog({
        module: "PORTAL_ACTION",
        entity,
        entityId: extractEntityId(req, responseBody),
        action: resolveAction(method),
        actorId: actor.actorId,
        actorType: actor.actorType,
        ...(changes ? { changes } : {}),
        snapshot: {
            before: beforeSnapshot?.record
                ? sanitizeValue(beforeSnapshot.record)
                : null,
            request: sanitizeValue(req.body ?? {}),
        },
        meta: {
            portalKey: portal.portalKey,
            portalName: portal.portalName,
            method,
            path: req.originalUrl,
            statusCode,
        },
    });
};
export const auditMutationMiddleware = (req, res, next) => {
    if (!shouldAuditRequest(req)) {
        next();
        return;
    }
    const setupAuditCapture = (beforeSnapshot) => {
        const originalJson = res.json.bind(res);
        let responseBody = null;
        res.json = ((body) => {
            responseBody = body;
            return originalJson(body);
        });
        res.on("finish", () => {
            void writePortalMutationAudit(req, responseBody, res.statusCode, beforeSnapshot).catch((error) => {
                logger.warn("Portal mutation audit failed", {
                    error: error?.message ?? error,
                });
            });
        });
    };
    void captureBeforeSnapshot(req)
        .catch((error) => {
        logger.warn("Portal mutation before-snapshot failed", {
            error: error?.message ?? error,
        });
        return null;
    })
        .then((beforeSnapshot) => {
        setupAuditCapture(beforeSnapshot);
        next();
    });
};
//# sourceMappingURL=audit-middleware.js.map