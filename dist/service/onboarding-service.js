import bcrypt from "bcrypt";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import {} from "../model/onboarding-model.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "./onboarding-material-service.js";
import { generateNotificationOutboxId, generateOnboardingAssignmentId, generateOnboardingMaterialProgressId, generateOnboardingStageProgressId, } from "../utils/id-generator.js";
import { resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { ensureHrdCrudAccess, ensureHrdReadAccess, } from "../utils/hrd-access.js";
import { Validation } from "../validation/validation.js";
import { OnboardingValidation } from "../validation/onboarding-validation.js";
const DEFAULT_PORTAL_KEY = "EMPLOYEE";
const EMPLOYEE_PARTICIPANT_REFERENCE_TYPE = "EMPLOYEE";
const PARTICIPANT_RECIPIENT_ROLE = "PARTICIPANT";
const OMS_FIRST_LOGIN_EVENT_KEY = "OMS_FIRST_LOGIN";
const ONBOARDING_ASSIGNMENT_CONTEXT_TYPE = "ONBOARDING_ASSIGNMENT";
const CHANNEL_WHATSAPP = "WHATSAPP";
const CHANNEL_EMAIL = "EMAIL";
const FINAL_ASSIGNMENT_STATUSES = new Set([
    "COMPLETED",
    "PASSED",
    "PASSED_OVERRIDE",
    "FAILED",
    "FAIL_FINAL",
    "CANCELLED",
]);
const ONBOARDING_ADMIN_PORTAL_KEYS = [
    "EMPLOYEE",
    "SUPPLIER",
    "CUSTOMER",
    "AFFILIATE",
    "INFLUENCER",
    "COMMUNITY",
];
const normalizePortalKey = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0
        ? trimmed.toUpperCase()
        : DEFAULT_PORTAL_KEY;
};
const normalizeNote = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
};
const normalizeUpper = (value) => (value ?? "").trim().toUpperCase();
const normalizePhone = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D+/g, "");
    return digits.length > 0 ? digits : null;
};
const normalizeEmail = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "-" ? trimmed : null;
};
const isEmployeeFirstLogin = (value) => Number(value ?? 0) !== 0;
const buildEmployeeFirstLoginPassword = (cardNumber, userId) => {
    const identifier = cardNumber?.trim() || String(userId ?? "").trim() || "user";
    return `semangatTraining-${identifier}`;
};
const resolveTemporaryPassword = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) {
        return "";
    }
    if (trimmed.startsWith("$2a$") ||
        trimmed.startsWith("$2b$") ||
        trimmed.startsWith("$2y$")) {
        return "";
    }
    return trimmed;
};
const trimAuditActor = (value) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.slice(0, 20) : null;
};
const addDays = (value, day) => new Date(value.getTime() + day * 24 * 60 * 60 * 1000);
const hasMeaningfulDate = (value) => {
    if (!value) {
        return false;
    }
    const date = value instanceof Date ? value : new Date(value);
    const time = date.getTime();
    return !Number.isNaN(time) && time !== 0;
};
const isFinalAssignmentStatus = (status) => {
    const normalized = status?.trim().toUpperCase();
    return normalized ? FINAL_ASSIGNMENT_STATUSES.has(normalized) : false;
};
const isCompletedAssignmentStatus = (status) => {
    const normalized = status?.trim().toUpperCase();
    return normalized
        ? normalized === "COMPLETED" ||
            normalized === "PASSED" ||
            normalized === "PASSED_TO_LMS" ||
            normalized === "PASSED_OVERRIDE"
        : false;
};
const ensureAdminMonitoringAccess = async (requesterUserId) => {
    const requester = await prismaFlowly.user.findUnique({
        where: { userId: requesterUserId },
        include: { role: true },
    });
    if (!requester) {
        throw new ResponseError(401, "Unauthorized");
    }
    if (!requester.isActive || requester.isDeleted || requester.role.roleLevel !== 1) {
        throw new ResponseError(403, "Admin access required");
    }
};
const getAdminPortalOrder = (portalKey) => {
    const index = ONBOARDING_ADMIN_PORTAL_KEYS.findIndex((item) => item === normalizePortalKey(portalKey));
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
};
const renderTemplate = (template, context) => template.replace(/\{badgeNumber\}/g, String(context.cardNumber ?? "")).replace(/\{(\w+)\}/g, (_, key) => {
    const value = context[key];
    if (value === undefined || value === null) {
        return "";
    }
    return String(value);
});
const trimMessage = (value) => value.trim().slice(0, 1000);
const parseWorkspaceSelectionMetadata = (note) => {
    const normalizedNote = normalizeNote(note);
    if (!normalizedNote) {
        return {
            mode: "ALL",
            selectedFileIds: [],
            rawNote: null,
        };
    }
    try {
        const parsed = JSON.parse(normalizedNote);
        const selectedFileIds = Array.isArray(parsed?.selectedFileIds)
            ? Array.from(new Set(parsed.selectedFileIds
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)))
            : [];
        return {
            mode: parsed?.mode === "SELECTED" && selectedFileIds.length > 0 ? "SELECTED" : "ALL",
            selectedFileIds,
            rawNote: null,
        };
    }
    catch {
        return {
            mode: "ALL",
            selectedFileIds: [],
            rawNote: normalizedNote,
        };
    }
};
const filterWorkspaceSelectedFiles = (files, metadata) => {
    if (metadata.mode !== "SELECTED" || metadata.selectedFileIds.length === 0) {
        return files;
    }
    const selectedFileIds = new Set(metadata.selectedFileIds);
    const filtered = files.filter((file) => selectedFileIds.has(file.id));
    return filtered.length > 0 ? filtered : files;
};
const buildMaterialProgressKey = (onboardingStageMaterialId, sourceFileId) => `${onboardingStageMaterialId}:${Number(sourceFileId ?? 0)}`;
const getMostRecentDate = (values) => values.reduce((latest, value) => {
    if (!value) {
        return latest;
    }
    if (!latest || value.getTime() > latest.getTime()) {
        return value;
    }
    return latest;
}, null);
const getEarliestDate = (values) => values.reduce((earliest, value) => {
    if (!value) {
        return earliest;
    }
    if (!earliest || value.getTime() < earliest.getTime()) {
        return value;
    }
    return earliest;
}, null);
const summarizeMaterialProgress = (fileProgresses, sourceFiles, stageStatus, fallbackDates) => {
    const normalizedStageStatus = normalizeUpper(stageStatus);
    const stageFinished = normalizedStageStatus === "WAITING_EXAM" ||
        normalizedStageStatus === "WAITING_ADMIN" ||
        normalizedStageStatus === "PASSED" ||
        normalizedStageStatus === "COMPLETED" ||
        normalizedStageStatus === "REMEDIAL" ||
        normalizedStageStatus === "FAILED" ||
        normalizedStageStatus === "FAIL_FINAL";
    const readAt = getEarliestDate(fileProgresses.map((item) => item.readAt)) ?? null;
    const lastReadAt = getMostRecentDate(fileProgresses.map((item) => item.lastReadAt)) ?? null;
    const completedAt = getMostRecentDate(fileProgresses.map((item) => item.completedAt)) ??
        (stageFinished ? fallbackDates.stageCompletedAt : null);
    const openCount = fileProgresses.reduce((sum, item) => sum + Number(item.openCount ?? 0), 0);
    let status = "PENDING";
    if (stageFinished) {
        status = "COMPLETED";
    }
    else if (readAt || lastReadAt || openCount > 0) {
        status = "READING";
    }
    else if (sourceFiles.length === 0 && fallbackDates.stageStartedAt) {
        status = "READING";
    }
    return {
        status,
        readAt,
        lastReadAt,
        completedAt,
        openCount,
    };
};
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
const resolveSupportName = () => normalizeNote(process.env.OMS_SUPPORT_NAME) ?? "";
const resolveSupportPhone = () => normalizeNote(process.env.OMS_SUPPORT_PHONE) ?? "";
const resolveRuntimeNotificationTemplates = async (params) => {
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
    const selectedByChannel = new Map();
    for (const item of items) {
        const channel = normalizeUpper(item.channel);
        if (channel !== CHANNEL_WHATSAPP && channel !== CHANNEL_EMAIL) {
            continue;
        }
        const isPortalSpecific = item.portalMappings.some((mapping) => normalizeUpper(mapping.portalKey) === portalKey);
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
    return Array.from(selectedByChannel.values()).map(({ isPortalSpecific: _isPortalSpecific, ...template }) => template);
};
const buildOnboardingNotificationContext = (params) => {
    const cardNumber = params.employee.CardNo?.trim() || String(params.employee.UserId);
    const username = cardNumber;
    const recipientName = params.employee.Name?.trim() || username;
    return {
        recipientName,
        portalName: params.portalName,
        portalKey: params.portalKey,
        cardNumber,
        username,
        temporaryPassword: params.temporaryPassword || resolveTemporaryPassword(params.employee.Password),
        deadlineDays: params.durationDay,
        dueDate: params.dueAt.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
        loginUrl: resolveOmsLoginUrl(),
        supportName: resolveSupportName(),
        supportPhone: resolveSupportPhone(),
    };
};
const toSummaryResponse = (employeeNameMap, assignment) => {
    const userId = Number(assignment.participantReferenceId);
    if (!Number.isFinite(userId) || userId <= 0) {
        return null;
    }
    const hasActiveAssignment = assignment.isActive && !isFinalAssignmentStatus(assignment.status);
    return {
        userId,
        employeeName: employeeNameMap.get(userId) ?? null,
        onboardingAssignmentId: assignment.onboardingAssignmentId,
        portalKey: assignment.portalKey,
        status: assignment.status,
        startedAt: assignment.startedAt,
        dueAt: assignment.dueAt,
        currentStageOrder: assignment.currentStageOrder,
        hasActiveAssignment,
        canStart: !hasActiveAssignment,
    };
};
export class OnboardingService {
    static async listMyWorkspace(requesterUserId) {
        const participantReferenceId = requesterUserId.trim();
        if (!participantReferenceId) {
            return { portals: [] };
        }
        const [assignments, sourceMaterials] = await Promise.all([
            prismaFlowly.onboardingAssignment.findMany({
                where: {
                    participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                    participantReferenceId,
                    isDeleted: false,
                },
                orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
                include: {
                    portalTemplate: {
                        select: {
                            onboardingPortalTemplateId: true,
                            portalKey: true,
                            portalName: true,
                        },
                    },
                    stageProgresses: {
                        where: {
                            isDeleted: false,
                            isActive: true,
                        },
                        orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
                        include: {
                            materialProgresses: {
                                where: {
                                    isDeleted: false,
                                    isActive: true,
                                },
                                orderBy: [{ readAt: "asc" }, { createdAt: "asc" }],
                                select: {
                                    onboardingMaterialProgressId: true,
                                    onboardingStageMaterialId: true,
                                    sourceFileId: true,
                                    status: true,
                                    readAt: true,
                                    lastReadAt: true,
                                    completedAt: true,
                                    openCount: true,
                                },
                            },
                            stageTemplate: {
                                select: {
                                    onboardingStageTemplateId: true,
                                    stageDescription: true,
                                    stageMaterials: {
                                        where: {
                                            isDeleted: false,
                                            isActive: true,
                                        },
                                        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                                        select: {
                                            onboardingStageMaterialId: true,
                                            materiId: true,
                                            orderIndex: true,
                                            isRequired: true,
                                            note: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            OnboardingMaterialService.listSourceMaterials(),
        ]);
        const latestByPortal = new Map();
        for (const assignment of assignments) {
            const portalKey = normalizePortalKey(assignment.portalKey);
            if (!latestByPortal.has(portalKey)) {
                latestByPortal.set(portalKey, assignment);
            }
        }
        const sourceMaterialMap = new Map(sourceMaterials.map((material) => [material.materialId, material]));
        const portals = Array.from(latestByPortal.values()).map((assignment) => ({
            onboardingAssignmentId: assignment.onboardingAssignmentId,
            onboardingPortalTemplateId: assignment.onboardingPortalTemplateId,
            portalKey: normalizePortalKey(assignment.portalTemplate?.portalKey ?? assignment.portalKey),
            portalName: normalizeNote(assignment.portalTemplate?.portalName) ??
                normalizePortalKey(assignment.portalKey),
            status: assignment.status,
            startedAt: assignment.startedAt,
            durationDay: assignment.durationDay,
            dueAt: assignment.dueAt,
            currentStageOrder: assignment.currentStageOrder,
            note: normalizeNote(assignment.note),
            stages: assignment.stageProgresses.map((stageProgress) => {
                const stageCompletedAt = stageProgress.completedAt ?? stageProgress.passedAt;
                const materialProgressMap = new Map(stageProgress.materialProgresses.map((progress) => [
                    buildMaterialProgressKey(progress.onboardingStageMaterialId, progress.sourceFileId),
                    {
                        onboardingMaterialProgressId: progress.onboardingMaterialProgressId,
                        onboardingStageMaterialId: progress.onboardingStageMaterialId,
                        sourceFileId: progress.sourceFileId,
                        status: progress.status,
                        readAt: progress.readAt,
                        lastReadAt: progress.lastReadAt,
                        completedAt: progress.completedAt,
                        openCount: progress.openCount,
                    },
                ]));
                return {
                    onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                    onboardingStageTemplateId: stageProgress.onboardingStageTemplateId,
                    stageOrder: stageProgress.stageOrder,
                    stageCode: stageProgress.stageCode,
                    stageName: stageProgress.stageName,
                    stageDescription: normalizeNote(stageProgress.stageTemplate.stageDescription) ??
                        normalizeNote(stageProgress.note),
                    status: stageProgress.status,
                    remedialCount: stageProgress.remedialCount,
                    startedAt: stageProgress.startedAt,
                    passedAt: stageProgress.passedAt,
                    completedAt: stageProgress.completedAt,
                    failedAt: stageProgress.failedAt,
                    note: normalizeNote(stageProgress.note),
                    materials: stageProgress.stageTemplate.stageMaterials.map((stageMaterial) => {
                        const sourceMaterial = sourceMaterialMap.get(stageMaterial.materiId);
                        const sourceFiles = (sourceMaterial?.files ?? []).map((file) => ({
                            id: file.id,
                            title: file.title,
                            fileName: file.fileName,
                            url: file.url,
                            fileType: file.fileType,
                            progressId: null,
                            status: "PENDING",
                            readAt: null,
                            lastReadAt: null,
                            completedAt: null,
                            openCount: 0,
                        }));
                        const selectionMetadata = parseWorkspaceSelectionMetadata(stageMaterial.note);
                        const selectedFiles = filterWorkspaceSelectedFiles(sourceFiles, selectionMetadata).map((file) => {
                            const progress = materialProgressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, file.id)) ?? null;
                            return {
                                ...file,
                                progressId: progress?.onboardingMaterialProgressId ?? null,
                                status: progress?.status ??
                                    (stageCompletedAt ? "COMPLETED" : file.readAt ? "READING" : "PENDING"),
                                readAt: progress?.readAt ?? null,
                                lastReadAt: progress?.lastReadAt ?? null,
                                completedAt: progress?.completedAt ?? stageCompletedAt ?? null,
                                openCount: progress?.openCount ?? 0,
                            };
                        });
                        const selectedFileIds = selectionMetadata.mode === "SELECTED"
                            ? selectedFiles.map((file) => file.id)
                            : sourceFiles.map((file) => file.id);
                        const fileSelectionMode = selectionMetadata.mode === "SELECTED" &&
                            selectedFiles.length < sourceFiles.length
                            ? "SELECTED"
                            : "ALL";
                        const materialLevelProgress = materialProgressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, 0)) ?? null;
                        const aggregateProgress = summarizeMaterialProgress(materialLevelProgress
                            ? [materialLevelProgress, ...selectedFiles.map((file) => ({
                                    onboardingMaterialProgressId: file.progressId ?? "",
                                    onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                                    sourceFileId: file.id,
                                    status: file.status,
                                    readAt: file.readAt,
                                    lastReadAt: file.lastReadAt,
                                    completedAt: file.completedAt,
                                    openCount: file.openCount,
                                }))]
                            : selectedFiles.map((file) => ({
                                onboardingMaterialProgressId: file.progressId ?? "",
                                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                                sourceFileId: file.id,
                                status: file.status,
                                readAt: file.readAt,
                                lastReadAt: file.lastReadAt,
                                completedAt: file.completedAt,
                                openCount: file.openCount,
                            })), selectedFiles, stageProgress.status, {
                            stageStartedAt: stageProgress.startedAt,
                            stageCompletedAt,
                        });
                        return {
                            assignmentId: stageMaterial.onboardingStageMaterialId,
                            materialId: stageMaterial.materiId,
                            materialCode: normalizeNote(sourceMaterial?.materialCode) ??
                                `MATERI-${stageMaterial.materiId}`,
                            materialTitle: normalizeNote(sourceMaterial?.materialTitle) ??
                                `Materi ${stageMaterial.materiId}`,
                            materialDescription: normalizeNote(sourceMaterial?.materialDescription),
                            materialTypes: sourceMaterial?.materialTypes ?? [],
                            isRequired: stageMaterial.isRequired,
                            orderIndex: stageMaterial.orderIndex,
                            totalFileCount: sourceFiles.length,
                            fileCount: selectedFiles.length,
                            selectedFileIds,
                            fileSelectionMode,
                            status: aggregateProgress.status,
                            readAt: aggregateProgress.readAt ??
                                materialLevelProgress?.readAt ??
                                null,
                            lastReadAt: aggregateProgress.lastReadAt ??
                                materialLevelProgress?.lastReadAt ??
                                null,
                            completedAt: aggregateProgress.completedAt ??
                                materialLevelProgress?.completedAt ??
                                null,
                            files: selectedFiles,
                            note: selectionMetadata.rawNote ??
                                normalizeNote(sourceMaterial?.assignmentNote) ??
                                null,
                        };
                    }),
                };
            }),
        }));
        return { portals };
    }
    static async listAdminMonitoring(requesterUserId) {
        await ensureAdminMonitoringAccess(requesterUserId);
        const portalKeys = Array.from(ONBOARDING_ADMIN_PORTAL_KEYS);
        const [portalTemplatesRaw, assignmentsRaw, sourceMaterials] = await Promise.all([
            prismaFlowly.onboardingPortalTemplate.findMany({
                where: {
                    portalKey: { in: portalKeys },
                    isActive: true,
                    isDeleted: false,
                },
                include: {
                    stageTemplates: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
                        select: {
                            onboardingStageTemplateId: true,
                            stageOrder: true,
                            stageCode: true,
                            stageName: true,
                            stageDescription: true,
                            stageMaterials: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                                select: {
                                    onboardingStageMaterialId: true,
                                    materiId: true,
                                    orderIndex: true,
                                    isRequired: true,
                                    note: true,
                                },
                            },
                        },
                    },
                },
            }),
            prismaFlowly.onboardingAssignment.findMany({
                where: {
                    portalKey: { in: portalKeys },
                    isDeleted: false,
                },
                orderBy: [
                    { portalKey: "asc" },
                    { participantReferenceType: "asc" },
                    { participantReferenceId: "asc" },
                    { startedAt: "desc" },
                    { createdAt: "desc" },
                ],
                select: {
                    onboardingAssignmentId: true,
                    onboardingPortalTemplateId: true,
                    portalKey: true,
                    participantReferenceType: true,
                    participantReferenceId: true,
                    startedAt: true,
                    dueAt: true,
                    status: true,
                    currentStageOrder: true,
                    stageProgresses: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
                        select: {
                            onboardingStageProgressId: true,
                            onboardingStageTemplateId: true,
                            stageOrder: true,
                            stageCode: true,
                            stageName: true,
                            status: true,
                            remedialCount: true,
                            startedAt: true,
                            passedAt: true,
                            completedAt: true,
                            failedAt: true,
                            note: true,
                            materialProgresses: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                orderBy: [{ readAt: "asc" }, { createdAt: "asc" }],
                                select: {
                                    onboardingMaterialProgressId: true,
                                    onboardingStageMaterialId: true,
                                    sourceFileId: true,
                                    status: true,
                                    readAt: true,
                                    lastReadAt: true,
                                    completedAt: true,
                                    openCount: true,
                                },
                            },
                        },
                    },
                },
            }),
            OnboardingMaterialService.listSourceMaterials(),
        ]);
        const portalTemplates = [...portalTemplatesRaw].sort((left, right) => getAdminPortalOrder(left.portalKey) - getAdminPortalOrder(right.portalKey));
        const latestAssignmentsByParticipant = new Map();
        for (const assignment of assignmentsRaw) {
            const key = [
                normalizePortalKey(assignment.portalKey),
                normalizeUpper(assignment.participantReferenceType),
                assignment.participantReferenceId,
            ].join(":");
            if (!latestAssignmentsByParticipant.has(key)) {
                latestAssignmentsByParticipant.set(key, assignment);
            }
        }
        const latestAssignments = Array.from(latestAssignmentsByParticipant.values());
        const employeeIds = latestAssignments
            .map((assignment) => Number(assignment.participantReferenceId))
            .filter((value) => Number.isInteger(value) && value > 0);
        const employees = employeeIds.length > 0
            ? await prismaEmployee.em_employee.findMany({
                where: {
                    UserId: {
                        in: employeeIds,
                    },
                },
                select: {
                    UserId: true,
                    CardNo: true,
                    BadgeNum: true,
                    Name: true,
                    Phone: true,
                    email: true,
                    DeptId: true,
                },
            })
            : [];
        const employeeMap = new Map(employees.map((employee) => [
            employee.UserId,
            {
                UserId: employee.UserId,
                CardNo: normalizeNote(employee.CardNo),
                BadgeNum: normalizeNote(employee.BadgeNum),
                Name: normalizeNote(employee.Name),
                Phone: normalizeNote(employee.Phone),
                email: normalizeEmail(employee.email),
                DeptId: Number.isInteger(employee.DeptId) && Number(employee.DeptId) > 0
                    ? Number(employee.DeptId)
                    : null,
            },
        ]));
        const departmentIds = Array.from(new Set(employees
            .map((employee) => Number(employee.DeptId ?? 0))
            .filter((value) => Number.isInteger(value) && value > 0)));
        const departments = departmentIds.length > 0
            ? await prismaEmployee.em_dept.findMany({
                where: {
                    DEPTID: {
                        in: departmentIds,
                    },
                },
                select: {
                    DEPTID: true,
                    DEPTNAME: true,
                },
            })
            : [];
        const departmentMap = new Map(departments.map((department) => [
            department.DEPTID,
            normalizeNote(department.DEPTNAME),
        ]));
        const sourceMaterialMap = new Map(sourceMaterials.map((material) => [material.materialId, material]));
        const portals = portalTemplates.map((portalTemplate) => {
            const portalKey = normalizePortalKey(portalTemplate.portalKey);
            const portalStageTemplates = portalTemplate.stageTemplates.map((stageTemplate) => ({
                onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                stageOrder: stageTemplate.stageOrder,
                stageCode: stageTemplate.stageCode,
                stageName: stageTemplate.stageName,
                stageDescription: normalizeNote(stageTemplate.stageDescription),
                materialCount: stageTemplate.stageMaterials.length,
            }));
            const participants = latestAssignments
                .filter((assignment) => normalizePortalKey(assignment.portalKey) === portalKey)
                .map((assignment) => {
                const numericParticipantId = Number(assignment.participantReferenceId);
                const employee = Number.isInteger(numericParticipantId) && numericParticipantId > 0
                    ? employeeMap.get(numericParticipantId) ?? null
                    : null;
                const stageProgressByTemplateId = new Map(assignment.stageProgresses.map((stageProgress) => [
                    stageProgress.onboardingStageTemplateId,
                    stageProgress,
                ]));
                const stages = portalTemplate.stageTemplates.map((stageTemplate) => {
                    const stageProgress = stageProgressByTemplateId.get(stageTemplate.onboardingStageTemplateId) ??
                        assignment.stageProgresses.find((item) => item.stageOrder === stageTemplate.stageOrder) ??
                        null;
                    const stageStatus = stageProgress?.status ?? "LOCKED";
                    const stageCompletedAt = stageProgress?.completedAt ?? stageProgress?.passedAt ?? null;
                    const materialProgressMap = new Map((stageProgress?.materialProgresses ?? []).map((progress) => [
                        buildMaterialProgressKey(progress.onboardingStageMaterialId, progress.sourceFileId),
                        {
                            onboardingMaterialProgressId: progress.onboardingMaterialProgressId,
                            onboardingStageMaterialId: progress.onboardingStageMaterialId,
                            sourceFileId: progress.sourceFileId,
                            status: progress.status,
                            readAt: progress.readAt,
                            lastReadAt: progress.lastReadAt,
                            completedAt: progress.completedAt,
                            openCount: progress.openCount,
                        },
                    ]));
                    const materials = stageTemplate.stageMaterials.map((stageMaterial) => {
                        const sourceMaterial = sourceMaterialMap.get(stageMaterial.materiId);
                        const sourceFiles = (sourceMaterial?.files ?? []).map((file) => ({
                            id: file.id,
                            title: file.title,
                            fileName: file.fileName,
                            url: file.url,
                            fileType: file.fileType,
                            progressId: null,
                            status: "PENDING",
                            readAt: null,
                            lastReadAt: null,
                            completedAt: null,
                            openCount: 0,
                        }));
                        const selectionMetadata = parseWorkspaceSelectionMetadata(stageMaterial.note);
                        const selectedFiles = filterWorkspaceSelectedFiles(sourceFiles, selectionMetadata).map((file) => {
                            const progress = materialProgressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, file.id)) ?? null;
                            return {
                                ...file,
                                progressId: progress?.onboardingMaterialProgressId ?? null,
                                status: progress?.status ??
                                    (stageCompletedAt ? "COMPLETED" : file.readAt ? "READING" : "PENDING"),
                                readAt: progress?.readAt ?? null,
                                lastReadAt: progress?.lastReadAt ?? null,
                                completedAt: progress?.completedAt ?? stageCompletedAt ?? null,
                                openCount: progress?.openCount ?? 0,
                            };
                        });
                        const selectedFileIds = selectionMetadata.mode === "SELECTED"
                            ? selectedFiles.map((file) => file.id)
                            : sourceFiles.map((file) => file.id);
                        const fileSelectionMode = selectionMetadata.mode === "SELECTED" &&
                            selectedFiles.length < sourceFiles.length
                            ? "SELECTED"
                            : "ALL";
                        const materialLevelProgress = materialProgressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, 0)) ?? null;
                        const aggregateProgress = summarizeMaterialProgress(materialLevelProgress
                            ? [
                                materialLevelProgress,
                                ...selectedFiles.map((file) => ({
                                    onboardingMaterialProgressId: file.progressId ?? "",
                                    onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                                    sourceFileId: file.id,
                                    status: file.status,
                                    readAt: file.readAt,
                                    lastReadAt: file.lastReadAt,
                                    completedAt: file.completedAt,
                                    openCount: file.openCount,
                                })),
                            ]
                            : selectedFiles.map((file) => ({
                                onboardingMaterialProgressId: file.progressId ?? "",
                                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                                sourceFileId: file.id,
                                status: file.status,
                                readAt: file.readAt,
                                lastReadAt: file.lastReadAt,
                                completedAt: file.completedAt,
                                openCount: file.openCount,
                            })), selectedFiles, stageStatus, {
                            stageStartedAt: stageProgress?.startedAt ?? null,
                            stageCompletedAt,
                        });
                        return {
                            onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                            materialId: stageMaterial.materiId,
                            materialCode: normalizeNote(sourceMaterial?.materialCode) ??
                                `MATERI-${stageMaterial.materiId}`,
                            materialTitle: normalizeNote(sourceMaterial?.materialTitle) ??
                                `Materi ${stageMaterial.materiId}`,
                            materialDescription: normalizeNote(sourceMaterial?.materialDescription),
                            isRequired: stageMaterial.isRequired,
                            orderIndex: stageMaterial.orderIndex,
                            totalFileCount: sourceFiles.length,
                            fileCount: selectedFiles.length,
                            selectedFileIds,
                            fileSelectionMode,
                            readFileCount: selectedFiles.filter((file) => Boolean(file.readAt ||
                                file.lastReadAt ||
                                file.openCount > 0)).length,
                            status: aggregateProgress.status,
                            readAt: aggregateProgress.readAt ?? materialLevelProgress?.readAt ?? null,
                            lastReadAt: aggregateProgress.lastReadAt ??
                                materialLevelProgress?.lastReadAt ??
                                null,
                            completedAt: aggregateProgress.completedAt ??
                                materialLevelProgress?.completedAt ??
                                null,
                            openCount: aggregateProgress.openCount ??
                                materialLevelProgress?.openCount ??
                                0,
                            note: selectionMetadata.rawNote ??
                                normalizeNote(sourceMaterial?.assignmentNote) ??
                                null,
                        };
                    });
                    return {
                        onboardingStageProgressId: stageProgress?.onboardingStageProgressId ?? null,
                        onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                        stageOrder: stageTemplate.stageOrder,
                        stageCode: stageTemplate.stageCode,
                        stageName: stageTemplate.stageName,
                        stageDescription: normalizeNote(stageTemplate.stageDescription),
                        status: stageStatus,
                        remedialCount: stageProgress?.remedialCount ?? 0,
                        startedAt: stageProgress?.startedAt ?? null,
                        passedAt: stageProgress?.passedAt ?? null,
                        completedAt: stageProgress?.completedAt ?? null,
                        failedAt: stageProgress?.failedAt ?? null,
                        note: normalizeNote(stageProgress?.note),
                        totalMaterialCount: materials.length,
                        readMaterialCount: materials.filter((material) => Boolean(material.readAt ||
                            material.lastReadAt ||
                            material.openCount > 0)).length,
                        totalOpenCount: materials.reduce((sum, material) => sum + Number(material.openCount ?? 0), 0),
                        firstReadAt: getEarliestDate(materials.map((material) => material.readAt)),
                        lastReadAt: getMostRecentDate(materials.map((material) => material.lastReadAt)),
                        materials,
                    };
                });
                const currentStage = stages.find((stage) => stage.stageOrder === Number(assignment.currentStageOrder ?? 0)) ??
                    stages.find((stage) => normalizeUpper(stage.status) !== "PASSED" &&
                        normalizeUpper(stage.status) !== "COMPLETED") ??
                    stages.at(-1) ??
                    null;
                return {
                    participantId: assignment.participantReferenceId,
                    participantReferenceType: assignment.participantReferenceType,
                    participantReferenceId: assignment.participantReferenceId,
                    participantName: employee?.Name ??
                        `Participant ${assignment.participantReferenceId}`,
                    cardNumber: employee?.CardNo ?? null,
                    badgeNumber: employee?.BadgeNum ?? null,
                    departmentName: employee?.DeptId != null
                        ? departmentMap.get(employee.DeptId) ?? null
                        : null,
                    phone: employee?.Phone ?? null,
                    email: employee?.email ?? null,
                    status: assignment.status,
                    startedAt: assignment.startedAt,
                    dueAt: assignment.dueAt,
                    currentStageOrder: currentStage?.stageOrder ?? assignment.currentStageOrder,
                    currentStageName: currentStage?.stageName ?? null,
                    totalMaterialCount: stages.reduce((sum, stage) => sum + stage.totalMaterialCount, 0),
                    readMaterialCount: stages.reduce((sum, stage) => sum + stage.readMaterialCount, 0),
                    totalOpenCount: stages.reduce((sum, stage) => sum + stage.totalOpenCount, 0),
                    firstReadAt: getEarliestDate(stages.map((stage) => stage.firstReadAt)),
                    lastReadAt: getMostRecentDate(stages.map((stage) => stage.lastReadAt)),
                    stages,
                };
            })
                .sort((left, right) => {
                const leftActive = isFinalAssignmentStatus(left.status) ? 1 : 0;
                const rightActive = isFinalAssignmentStatus(right.status) ? 1 : 0;
                if (leftActive !== rightActive) {
                    return leftActive - rightActive;
                }
                const leftStage = Number(left.currentStageOrder ?? 999);
                const rightStage = Number(right.currentStageOrder ?? 999);
                if (leftStage !== rightStage) {
                    return leftStage - rightStage;
                }
                return left.participantName.localeCompare(right.participantName);
            });
            return {
                onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
                portalKey,
                portalName: portalTemplate.portalName,
                totalStageCount: portalStageTemplates.length,
                totalParticipants: participants.length,
                activeParticipants: participants.filter((participant) => !isFinalAssignmentStatus(participant.status)).length,
                completedParticipants: participants.filter((participant) => isCompletedAssignmentStatus(participant.status)).length,
                totalOpenCount: participants.reduce((sum, participant) => sum + Number(participant.totalOpenCount ?? 0), 0),
                firstReadAt: getEarliestDate(participants.map((participant) => participant.firstReadAt)),
                lastReadAt: getMostRecentDate(participants.map((participant) => participant.lastReadAt)),
                stages: portalStageTemplates,
                participants,
            };
        });
        return { portals };
    }
    static async startMaterialRead(requesterUserId, request) {
        const participantReferenceId = requesterUserId.trim();
        if (!participantReferenceId) {
            throw new ResponseError(401, "Unauthorized");
        }
        const validated = Validation.validate(OnboardingValidation.START_MATERIAL_READ, request);
        const sourceFileId = Number(validated.sourceFileId ?? 0);
        const normalizedSourceFileId = Number.isInteger(sourceFileId) && sourceFileId > 0 ? sourceFileId : 0;
        const actorId = trimAuditActor(requesterUserId);
        const transactionTime = new Date();
        const createMaterialProgressId = await generateOnboardingMaterialProgressId();
        return prismaFlowly.$transaction(async (tx) => {
            const stageProgress = await tx.onboardingStageProgress.findFirst({
                where: {
                    onboardingStageProgressId: validated.onboardingStageProgressId,
                    onboardingAssignmentId: validated.onboardingAssignmentId,
                    isDeleted: false,
                    isActive: true,
                },
                include: {
                    assignment: {
                        select: {
                            onboardingAssignmentId: true,
                            participantReferenceType: true,
                            participantReferenceId: true,
                            currentStageOrder: true,
                        },
                    },
                },
            });
            if (!stageProgress) {
                throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
            }
            if (normalizeUpper(stageProgress.assignment.participantReferenceType) !==
                EMPLOYEE_PARTICIPANT_REFERENCE_TYPE ||
                stageProgress.assignment.participantReferenceId !== participantReferenceId) {
                throw new ResponseError(403, "Anda tidak memiliki akses ke materi ini");
            }
            if (normalizeUpper(stageProgress.status) === "LOCKED") {
                throw new ResponseError(403, "Tahap onboarding ini belum aktif untuk dibaca");
            }
            const stageMaterial = await tx.onboardingStageMaterial.findFirst({
                where: {
                    onboardingStageMaterialId: validated.onboardingStageMaterialId,
                    onboardingStageTemplateId: stageProgress.onboardingStageTemplateId,
                    isDeleted: false,
                    isActive: true,
                },
                select: {
                    onboardingStageMaterialId: true,
                    materiId: true,
                },
            });
            if (!stageMaterial) {
                throw new ResponseError(404, "Materi onboarding tidak ditemukan");
            }
            const finalStageStatus = !stageProgress.startedAt &&
                (normalizeUpper(stageProgress.status) === "PENDING" ||
                    normalizeUpper(stageProgress.status) === "NOT_STARTED")
                ? "READING"
                : stageProgress.status;
            if (!stageProgress.startedAt || finalStageStatus !== stageProgress.status) {
                await tx.onboardingStageProgress.update({
                    where: {
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                    },
                    data: {
                        startedAt: stageProgress.startedAt ?? transactionTime,
                        status: finalStageStatus,
                        updatedBy: actorId,
                    },
                });
            }
            if (stageProgress.assignment.currentStageOrder === null ||
                stageProgress.stageOrder > stageProgress.assignment.currentStageOrder) {
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: stageProgress.assignment.onboardingAssignmentId,
                    },
                    data: {
                        currentStageOrder: stageProgress.stageOrder,
                        updatedBy: actorId,
                    },
                });
            }
            const existingProgress = await tx.onboardingMaterialProgress.findUnique({
                where: {
                    onboardingStageProgressId_onboardingStageMaterialId_sourceFileId: {
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                        onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                        sourceFileId: normalizedSourceFileId,
                    },
                },
            });
            const materialProgress = existingProgress
                ? await tx.onboardingMaterialProgress.update({
                    where: {
                        onboardingMaterialProgressId: existingProgress.onboardingMaterialProgressId,
                    },
                    data: {
                        fileName: normalizeNote(validated.fileName) ?? existingProgress.fileName,
                        fileTitle: normalizeNote(validated.fileTitle) ?? existingProgress.fileTitle,
                        status: normalizeUpper(existingProgress.status) === "COMPLETED"
                            ? existingProgress.status
                            : "READING",
                        readAt: existingProgress.readAt ?? transactionTime,
                        lastReadAt: transactionTime,
                        openCount: {
                            increment: 1,
                        },
                        updatedBy: actorId,
                    },
                })
                : await tx.onboardingMaterialProgress.create({
                    data: {
                        onboardingMaterialProgressId: createMaterialProgressId(),
                        onboardingAssignmentId: stageProgress.onboardingAssignmentId,
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                        onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                        materiId: stageMaterial.materiId,
                        sourceFileId: normalizedSourceFileId,
                        fileName: normalizeNote(validated.fileName) ?? null,
                        fileTitle: normalizeNote(validated.fileTitle) ?? null,
                        status: "READING",
                        readAt: transactionTime,
                        lastReadAt: transactionTime,
                        completedAt: null,
                        openCount: 1,
                        note: null,
                        isActive: true,
                        isDeleted: false,
                        createdAt: transactionTime,
                        createdBy: actorId,
                        updatedAt: transactionTime,
                        updatedBy: actorId,
                        deletedAt: null,
                        deletedBy: null,
                    },
                });
            return {
                onboardingMaterialProgressId: materialProgress.onboardingMaterialProgressId,
                onboardingAssignmentId: stageProgress.onboardingAssignmentId,
                onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                sourceFileId: normalizedSourceFileId,
                status: materialProgress.status,
                stageStatus: finalStageStatus,
                readAt: materialProgress.readAt,
                lastReadAt: materialProgress.lastReadAt,
                openCount: materialProgress.openCount,
            };
        });
    }
    static async listEmployeeSummary(requesterUserId, request) {
        await ensureHrdReadAccess(requesterUserId);
        const validated = Validation.validate(OnboardingValidation.LIST_EMPLOYEE_SUMMARY, request);
        const portalKey = normalizePortalKey(validated.portalKey);
        const assignments = await prismaFlowly.onboardingAssignment.findMany({
            where: {
                portalKey,
                participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                isDeleted: false,
            },
            orderBy: [
                { participantReferenceId: "asc" },
                { startedAt: "desc" },
                { createdAt: "desc" },
            ],
            select: {
                onboardingAssignmentId: true,
                participantReferenceId: true,
                portalKey: true,
                status: true,
                startedAt: true,
                dueAt: true,
                currentStageOrder: true,
                isActive: true,
            },
        });
        const latestByEmployee = new Map();
        for (const assignment of assignments) {
            if (!latestByEmployee.has(assignment.participantReferenceId)) {
                latestByEmployee.set(assignment.participantReferenceId, assignment);
            }
        }
        const employeeIds = Array.from(latestByEmployee.keys())
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value > 0);
        const employees = employeeIds.length > 0
            ? await prismaEmployee.em_employee.findMany({
                where: { UserId: { in: employeeIds } },
                select: {
                    UserId: true,
                    Name: true,
                },
            })
            : [];
        const employeeNameMap = new Map(employees.map((employee) => [employee.UserId, employee.Name ?? null]));
        return Array.from(latestByEmployee.values())
            .map((assignment) => toSummaryResponse(employeeNameMap, assignment))
            .filter((item) => item !== null)
            .sort((left, right) => left.userId - right.userId);
    }
    static async startEmployees(requesterUserId, request) {
        await ensureHrdCrudAccess(requesterUserId);
        const validated = Validation.validate(OnboardingValidation.START_EMPLOYEE, request);
        const portalKey = normalizePortalKey(validated.portalKey);
        const startedAt = validated.startedAt
            ? new Date(validated.startedAt)
            : new Date();
        const note = normalizeNote(validated.note);
        const portalTemplate = await prismaFlowly.onboardingPortalTemplate.findFirst({
            where: {
                portalKey,
                isActive: true,
                isDeleted: false,
            },
            select: {
                onboardingPortalTemplateId: true,
                portalKey: true,
                portalName: true,
                defaultDurationDay: true,
            },
        });
        if (!portalTemplate) {
            throw new ResponseError(400, `Template onboarding portal ${portalKey} tidak ditemukan`);
        }
        const stageTemplates = await prismaFlowly.onboardingStageTemplate.findMany({
            where: {
                onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
                isActive: true,
                isDeleted: false,
            },
            orderBy: [{ stageOrder: "asc" }, { stageCode: "asc" }],
            select: {
                onboardingStageTemplateId: true,
                stageOrder: true,
                stageCode: true,
                stageName: true,
            },
        });
        if (stageTemplates.length === 0) {
            throw new ResponseError(400, `Template onboarding portal ${portalKey} belum memiliki tahap aktif`);
        }
        const durationDay = validated.durationDay && validated.durationDay > 0
            ? validated.durationDay
            : portalTemplate.defaultDurationDay;
        const employees = await prismaEmployee.em_employee.findMany({
            where: {
                UserId: { in: validated.userIds },
            },
            select: {
                UserId: true,
                CardNo: true,
                Name: true,
                Phone: true,
                email: true,
                Password: true,
                ResignDate: true,
                isFirstLogin: true,
            },
        });
        const employeeMap = new Map(employees.map((employee) => [
            employee.UserId,
            {
                UserId: employee.UserId,
                CardNo: employee.CardNo ?? null,
                Name: employee.Name ?? null,
                Phone: employee.Phone ?? null,
                email: normalizeEmail(employee.email),
                Password: employee.Password ?? null,
                ResignDate: employee.ResignDate ?? null,
                isFirstLogin: employee.isFirstLogin ?? null,
            },
        ]));
        const skipped = [];
        for (const userId of validated.userIds) {
            if (!employeeMap.has(userId)) {
                skipped.push({
                    userId,
                    employeeName: null,
                    reason: "Karyawan tidak ditemukan",
                });
            }
        }
        const eligibleEmployees = employees.filter((employee) => !hasMeaningfulDate(employee.ResignDate));
        for (const employee of employees) {
            if (hasMeaningfulDate(employee.ResignDate)) {
                skipped.push({
                    userId: employee.UserId,
                    employeeName: employee.Name ?? null,
                    reason: "Karyawan sudah resign",
                });
            }
        }
        const existingAssignments = eligibleEmployees.length > 0
            ? await prismaFlowly.onboardingAssignment.findMany({
                where: {
                    portalKey,
                    participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                    participantReferenceId: {
                        in: eligibleEmployees.map((employee) => String(employee.UserId)),
                    },
                    isDeleted: false,
                    isActive: true,
                },
                select: {
                    participantReferenceId: true,
                    status: true,
                },
            })
            : [];
        const activeAssignmentIds = new Set(existingAssignments
            .filter((assignment) => !isFinalAssignmentStatus(assignment.status))
            .map((assignment) => Number(assignment.participantReferenceId))
            .filter((value) => Number.isFinite(value) && value > 0));
        const startableEmployees = eligibleEmployees.filter((employee) => {
            if (activeAssignmentIds.has(employee.UserId)) {
                skipped.push({
                    userId: employee.UserId,
                    employeeName: employee.Name ?? null,
                    reason: "Onboarding masih aktif",
                });
                return false;
            }
            return true;
        });
        if (startableEmployees.length === 0) {
            return {
                portalKey,
                started: [],
                skipped,
            };
        }
        const createAssignmentId = await generateOnboardingAssignmentId();
        const createStageProgressId = await generateOnboardingStageProgressId();
        const runtimeTemplates = await resolveRuntimeNotificationTemplates({
            portalKey,
            eventKey: OMS_FIRST_LOGIN_EVENT_KEY,
            recipientRole: PARTICIPANT_RECIPIENT_ROLE,
        });
        const createNotificationOutboxId = runtimeTemplates.length > 0 ? await generateNotificationOutboxId() : null;
        const actorId = trimAuditActor(requesterUserId);
        const firstStageOrder = stageTemplates[0]?.stageOrder ?? null;
        const transactionTime = new Date();
        const employeePasswordUpdates = [];
        const assignmentsToCreate = [];
        const stageProgressesToCreate = [];
        const notificationOutboxesToCreate = [];
        const started = [];
        for (const employee of startableEmployees) {
            const onboardingAssignmentId = createAssignmentId();
            const dueAt = addDays(startedAt, durationDay);
            const temporaryPassword = isEmployeeFirstLogin(employee.isFirstLogin)
                ? buildEmployeeFirstLoginPassword(employee.CardNo, employee.UserId)
                : "";
            if (temporaryPassword) {
                employeePasswordUpdates.push({
                    userId: employee.UserId,
                    hashedPassword: await bcrypt.hash(temporaryPassword, 10),
                });
            }
            assignmentsToCreate.push({
                onboardingAssignmentId,
                onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
                portalKey,
                participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                participantReferenceId: String(employee.UserId),
                startedAt,
                durationDay,
                dueAt,
                status: "IN_PROGRESS",
                currentStageOrder: firstStageOrder,
                assignedAt: transactionTime,
                assignedBy: actorId,
                note,
                completedAt: null,
                completedBy: null,
                failedAt: null,
                failedBy: null,
                parentOnboardingAssignmentId: null,
                isActive: true,
                isDeleted: false,
                createdAt: transactionTime,
                createdBy: actorId,
                updatedAt: transactionTime,
                updatedBy: actorId,
                deletedAt: null,
                deletedBy: null,
            });
            if (createNotificationOutboxId) {
                const context = buildOnboardingNotificationContext({
                    employee: {
                        UserId: employee.UserId,
                        CardNo: employee.CardNo ?? null,
                        Name: employee.Name ?? null,
                        Phone: employee.Phone ?? null,
                        email: normalizeEmail(employee.email),
                        Password: employee.Password ?? null,
                        ResignDate: employee.ResignDate ?? null,
                        isFirstLogin: employee.isFirstLogin ?? null,
                    },
                    portalKey,
                    portalName: portalTemplate.portalName,
                    durationDay,
                    dueAt,
                    temporaryPassword,
                });
                const phoneNumber = normalizePhone(employee.Phone);
                const email = normalizeEmail(employee.email);
                notificationOutboxesToCreate.push(...runtimeTemplates.map((template) => ({
                    notificationOutboxId: createNotificationOutboxId(),
                    notificationTemplateId: template.notificationTemplateId,
                    portalKey,
                    eventKey: OMS_FIRST_LOGIN_EVENT_KEY,
                    recipientRole: PARTICIPANT_RECIPIENT_ROLE,
                    recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                    recipientReferenceId: String(employee.UserId),
                    contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
                    contextReferenceId: onboardingAssignmentId,
                    phoneNumber: template.channel === CHANNEL_WHATSAPP ? phoneNumber ?? "" : "",
                    message: trimMessage(renderTemplate(template.messageTemplate, context)),
                    status: "PENDING",
                    attempts: 0,
                    lastError: null,
                    provider: null,
                    sentAt: null,
                    meta: JSON.stringify({
                        channel: template.channel,
                        email,
                        phoneNumber,
                        portalName: portalTemplate.portalName,
                        cardNumber: context.cardNumber,
                        username: context.username,
                        temporaryPassword: context.temporaryPassword,
                        deadlineDays: context.deadlineDays,
                        dueDate: context.dueDate,
                        loginUrl: context.loginUrl,
                    }),
                    isActive: true,
                    isDeleted: false,
                    createdAt: transactionTime,
                    createdBy: actorId,
                    updatedAt: transactionTime,
                    updatedBy: actorId,
                    deletedAt: null,
                    deletedBy: null,
                })));
            }
            stageProgressesToCreate.push(...stageTemplates.map((stageTemplate, index) => ({
                onboardingStageProgressId: createStageProgressId(),
                onboardingAssignmentId,
                onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                stageOrder: stageTemplate.stageOrder,
                stageCode: stageTemplate.stageCode,
                stageName: stageTemplate.stageName,
                status: index === 0 ? "READING" : "LOCKED",
                remedialCount: 0,
                startedAt: index === 0 ? startedAt : null,
                passedAt: null,
                completedAt: null,
                failedAt: null,
                note: null,
                isActive: true,
                isDeleted: false,
                createdAt: transactionTime,
                createdBy: actorId,
                updatedAt: transactionTime,
                updatedBy: actorId,
                deletedAt: null,
                deletedBy: null,
            })));
            started.push({
                userId: employee.UserId,
                employeeName: employee.Name ?? null,
                onboardingAssignmentId,
                portalKey,
                status: "IN_PROGRESS",
                startedAt,
                dueAt,
                currentStageOrder: firstStageOrder,
            });
        }
        for (const passwordUpdate of employeePasswordUpdates) {
            await prismaEmployee.em_employee.update({
                where: { UserId: passwordUpdate.userId },
                data: {
                    Password: passwordUpdate.hashedPassword,
                    isFirstLogin: 1,
                    Lastupdate: transactionTime,
                },
            });
        }
        await prismaFlowly.$transaction(async (tx) => {
            await tx.onboardingAssignment.createMany({
                data: assignmentsToCreate,
            });
            await tx.onboardingStageProgress.createMany({
                data: stageProgressesToCreate,
            });
        });
        if (notificationOutboxesToCreate.length > 0) {
            try {
                await prismaFlowly.notificationOutbox.createMany({
                    data: notificationOutboxesToCreate,
                });
            }
            catch (error) {
                logger.warn("Failed to enqueue onboarding notification outbox", {
                    portalKey,
                    eventKey: OMS_FIRST_LOGIN_EVENT_KEY,
                    employeeCount: notificationOutboxesToCreate.length,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        await Promise.all(started.map((item) => writeAuditLog({
            module: "HRD",
            entity: "ONBOARDING_ASSIGNMENT",
            entityId: item.onboardingAssignmentId,
            action: "CREATE",
            actorId: requesterUserId,
            actorType: resolveActorType(requesterUserId),
            snapshot: {
                userId: item.userId,
                employeeName: item.employeeName,
                portalKey: item.portalKey,
                status: item.status,
                startedAt: item.startedAt.toISOString(),
                dueAt: item.dueAt.toISOString(),
                currentStageOrder: item.currentStageOrder,
            },
            meta: {
                source: "HRD_PAGE",
                note,
            },
        })));
        return {
            portalKey,
            started,
            skipped,
        };
    }
}
//# sourceMappingURL=onboarding-service.js.map