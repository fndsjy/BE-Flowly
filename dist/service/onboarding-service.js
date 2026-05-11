import bcrypt from "bcrypt";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { invalidateProfileCache } from "../application/profile-cache.js";
import {} from "../model/onboarding-model.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "./onboarding-material-service.js";
import { OnboardingExamResultSyncService } from "./onboarding-exam-result-sync-service.js";
import { generateNotificationOutboxId, generateOnboardingAssignmentId, generateOnboardingDecisionId, generateOnboardingMaterialProgressId, generateOnboardingStageProgressId, } from "../utils/id-generator.js";
import { resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { ensureHrdCrudAccess, ensureHrdReadAccess, resolveHrdAccessLevel, } from "../utils/hrd-access.js";
import { Validation } from "../validation/validation.js";
import { OnboardingValidation } from "../validation/onboarding-validation.js";
const DEFAULT_PORTAL_KEY = "EMPLOYEE";
const EMPLOYEE_PARTICIPANT_REFERENCE_TYPE = "EMPLOYEE";
const PROGRAM_TYPE_ONBOARDING = "ONBOARDING";
const PARTICIPANT_RECIPIENT_ROLE = "PARTICIPANT";
const HRD_RECIPIENT_ROLE = "HRD";
const SBU_SUB_PIC_RECIPIENT_ROLE = "SBU_SUB_PIC";
const OMS_FIRST_LOGIN_EVENT_KEY = "OMS_FIRST_LOGIN";
const ONBOARDING_STARTED_EVENT_KEY = "ONBOARDING_STARTED";
const ONBOARDING_OVERDUE_FAILED_EVENT_KEY = "ONBOARDING_OVERDUE_FAILED";
const ONBOARDING_PIC_DECISION_EVENT_KEY = "ONBOARDING_PIC_DECISION";
const ONBOARDING_ASSIGNMENT_CONTEXT_TYPE = "ONBOARDING_ASSIGNMENT";
const ONBOARDING_DECISION_CONTEXT_TYPE = "ONBOARDING_DECISION";
const CHANNEL_WHATSAPP = "WHATSAPP";
const CHANNEL_EMAIL = "EMAIL";
const ONBOARDING_EMPLOYEE_BATCH_CODE = "ONB";
const AUTO_FAILED_DECISION_TYPE = "AUTO_FAILED";
const DECISION_PASS_OVERRIDE = "PASS_OVERRIDE";
const DECISION_EXTEND = "EXTEND";
const DECISION_FAIL_FINAL = "FAIL_FINAL";
const DECISION_FREEZE_TRANSFER_REVIEW = "FREEZE_TRANSFER_REVIEW";
const DECISION_CANCEL_TRANSFER_REVIEW = "CANCEL_TRANSFER_REVIEW";
const ASSIGNMENT_STATUS_TRANSFER_REVIEW = "TRANSFER_REVIEW";
const DEFAULT_EXTENSION_DURATION_DAYS = 90;
const DEFAULT_CERTIFICATE_ASSET_BASE_URL = "https://lms.domas.co.id/assets/img/sertifikat/peserta";
const FINAL_ASSIGNMENT_STATUSES = new Set([
    "COMPLETED",
    "PASSED",
    "PASSED_TO_LMS",
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
const ONBOARDING_PLACEMENT_REQUIRED_REASON = "Karyawan belum terdaftar di struktur organisasi atau sebagai PIC pilar/SBU/SBU SUB";
const ONBOARDING_PLACEMENT_SOURCES = {
    CHART_MEMBER: "CHART_MEMBER",
    PILAR_PIC: "PILAR_PIC",
    SBU_PIC: "SBU_PIC",
    SBU_SUB_PIC: "SBU_SUB_PIC",
};
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
const normalizeExamScore = (value) => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
        const numeric = Number(value.trim().replace(",", "."));
        return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
};
const getOnboardingScheduleName = (portalKey, stageCode) => `ONBOARDING|${normalizePortalKey(portalKey)}|${stageCode}`.slice(0, 255);
const resolveCertificateAssetBaseUrl = () => (normalizeNote(process.env.LMS_CERTIFICATE_ASSET_BASE_URL) ??
    DEFAULT_CERTIFICATE_ASSET_BASE_URL).replace(/\/+$/, "");
const encodeCertificatePath = (fileName) => fileName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
const toCertificatePdfFileName = (fileName) => {
    const withoutQuery = fileName.split("?")[0] ?? fileName;
    if (/\.[^.\\/]+$/.test(withoutQuery)) {
        return fileName.replace(/\.[^.\\/?.]+(?=\?|$)/, ".pdf");
    }
    return `${fileName}.pdf`;
};
const buildCertificateAssetUrls = (fileName) => {
    const baseUrl = resolveCertificateAssetBaseUrl();
    return {
        imageUrl: `${baseUrl}/${encodeCertificatePath(fileName)}`,
        pdfUrl: `${baseUrl}/${encodeCertificatePath(toCertificatePdfFileName(fileName))}`,
    };
};
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
const hasHrdCrudAccess = async (requesterUserId) => {
    try {
        return (await resolveHrdAccessLevel(requesterUserId)) === "CRUD";
    }
    catch (error) {
        if (error instanceof ResponseError && (error.status === 401 || error.status === 403)) {
            return false;
        }
        throw error;
    }
};
const resolveRequesterEmployeeId = async (requesterUserId) => {
    const numericId = Number(requesterUserId);
    if (Number.isInteger(numericId) && numericId > 0) {
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: numericId },
            select: { UserId: true },
        });
        if (employee) {
            return employee.UserId;
        }
    }
    const flowlyUser = await prismaFlowly.user.findUnique({
        where: { userId: requesterUserId },
        select: { badgeNumber: true },
    });
    const cardNumber = normalizeNote(flowlyUser?.badgeNumber);
    if (!cardNumber) {
        return null;
    }
    const employee = await prismaEmployee.em_employee.findFirst({
        where: { CardNo: cardNumber },
        select: { UserId: true },
    });
    return employee?.UserId ?? null;
};
const resolvePicOnboardingScope = async (requesterUserId) => {
    const employeeId = await resolveRequesterEmployeeId(requesterUserId);
    if (!employeeId) {
        return null;
    }
    const [pilarPics, sbuPics, sbuSubPics] = await Promise.all([
        prismaEmployee.em_pilar.findMany({
            where: {
                pic: employeeId,
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true },
        }),
        prismaEmployee.em_sbu.findMany({
            where: {
                pic: employeeId,
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true, sbu_pilar: true },
        }),
        prismaEmployee.em_sbu_sub.findMany({
            where: {
                pic: employeeId,
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true, sbu_id: true, sbu_pilar: true },
        }),
    ]);
    if (pilarPics.length === 0 && sbuPics.length === 0 && sbuSubPics.length === 0) {
        return null;
    }
    const pilarIds = new Set();
    const sbuIds = new Set();
    const sbuSubIds = new Set();
    const pilarPicIds = pilarPics.map((pilar) => pilar.id);
    const sbuPicIds = sbuPics.map((sbu) => sbu.id);
    for (const pilar of pilarPics) {
        pilarIds.add(pilar.id);
    }
    for (const sbu of sbuPics) {
        sbuIds.add(sbu.id);
    }
    for (const sbuSub of sbuSubPics) {
        sbuSubIds.add(sbuSub.id);
    }
    const [sbusByPilar, sbuSubsByPilar, sbuSubsBySbu] = await Promise.all([
        pilarPicIds.length > 0
            ? prismaEmployee.em_sbu.findMany({
                where: {
                    sbu_pilar: { in: pilarPicIds },
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { id: true },
            })
            : [],
        pilarPicIds.length > 0
            ? prismaEmployee.em_sbu_sub.findMany({
                where: {
                    sbu_pilar: { in: pilarPicIds },
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { id: true },
            })
            : [],
        sbuPicIds.length > 0
            ? prismaEmployee.em_sbu_sub.findMany({
                where: {
                    sbu_id: { in: sbuPicIds },
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { id: true },
            })
            : [],
    ]);
    for (const sbu of sbusByPilar) {
        sbuIds.add(sbu.id);
    }
    for (const sbuSub of [...sbuSubsByPilar, ...sbuSubsBySbu]) {
        sbuSubIds.add(sbuSub.id);
    }
    return {
        employeeId,
        pilarIds,
        sbuIds,
        sbuSubIds,
    };
};
const buildPicParticipantEmployeeIds = async (scope) => {
    const employeeIds = new Set();
    const addEmployeeId = (value) => {
        if (Number.isInteger(value) && Number(value) > 0 && value !== scope.employeeId) {
            employeeIds.add(Number(value));
        }
    };
    const chartWhere = [];
    if (scope.sbuSubIds.size > 0) {
        chartWhere.push({ sbuSubId: { in: Array.from(scope.sbuSubIds) } });
    }
    if (scope.sbuIds.size > 0) {
        chartWhere.push({ sbuId: { in: Array.from(scope.sbuIds) } });
    }
    if (scope.pilarIds.size > 0) {
        chartWhere.push({ pilarId: { in: Array.from(scope.pilarIds) } });
    }
    const chartMembers = chartWhere.length > 0
        ? await prismaFlowly.chartMember.findMany({
            where: {
                isDeleted: false,
                userId: { not: null },
                node: {
                    isDeleted: false,
                    OR: chartWhere,
                },
            },
            select: { userId: true },
        })
        : [];
    for (const member of chartMembers) {
        addEmployeeId(member.userId);
    }
    const [pilarPics, sbuPics, sbuSubPics] = await Promise.all([
        scope.pilarIds.size > 0
            ? prismaEmployee.em_pilar.findMany({
                where: {
                    id: { in: Array.from(scope.pilarIds) },
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { pic: true },
            })
            : [],
        scope.sbuIds.size > 0 || scope.pilarIds.size > 0
            ? prismaEmployee.em_sbu.findMany({
                where: {
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                    AND: [
                        {
                            OR: [
                                ...(scope.sbuIds.size > 0
                                    ? [{ id: { in: Array.from(scope.sbuIds) } }]
                                    : []),
                                ...(scope.pilarIds.size > 0
                                    ? [{ sbu_pilar: { in: Array.from(scope.pilarIds) } }]
                                    : []),
                            ],
                        },
                    ],
                },
                select: { pic: true },
            })
            : [],
        scope.sbuSubIds.size > 0 || scope.sbuIds.size > 0 || scope.pilarIds.size > 0
            ? prismaEmployee.em_sbu_sub.findMany({
                where: {
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                    AND: [
                        {
                            OR: [
                                ...(scope.sbuSubIds.size > 0
                                    ? [{ id: { in: Array.from(scope.sbuSubIds) } }]
                                    : []),
                                ...(scope.sbuIds.size > 0
                                    ? [{ sbu_id: { in: Array.from(scope.sbuIds) } }]
                                    : []),
                                ...(scope.pilarIds.size > 0
                                    ? [{ sbu_pilar: { in: Array.from(scope.pilarIds) } }]
                                    : []),
                            ],
                        },
                    ],
                },
                select: { pic: true },
            })
            : [],
    ]);
    for (const item of [...pilarPics, ...sbuPics, ...sbuSubPics]) {
        addEmployeeId(item.pic);
    }
    return employeeIds;
};
const ensurePicCanAccessParticipant = async (requesterUserId, participantReferenceType, participantReferenceId) => {
    if (normalizeUpper(participantReferenceType) !== EMPLOYEE_PARTICIPANT_REFERENCE_TYPE) {
        return false;
    }
    const participantEmployeeId = Number(participantReferenceId);
    if (!Number.isInteger(participantEmployeeId) || participantEmployeeId <= 0) {
        return false;
    }
    const scope = await resolvePicOnboardingScope(requesterUserId);
    if (!scope) {
        return false;
    }
    const employeeIds = await buildPicParticipantEmployeeIds(scope);
    return employeeIds.has(participantEmployeeId);
};
const buildDirectSbuSubPicParticipantEmployeeIds = async (requesterUserId) => {
    const requesterEmployeeId = await resolveRequesterEmployeeId(requesterUserId);
    if (!requesterEmployeeId) {
        return new Set();
    }
    const directSbuSubs = await prismaEmployee.em_sbu_sub.findMany({
        where: {
            pic: requesterEmployeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    if (directSbuSubs.length === 0) {
        return new Set();
    }
    return buildPicParticipantEmployeeIds({
        employeeId: requesterEmployeeId,
        pilarIds: new Set(),
        sbuIds: new Set(),
        sbuSubIds: new Set(directSbuSubs.map((sbuSub) => sbuSub.id)),
    });
};
const ensureDirectSbuSubPicCanAccessParticipant = async (requesterUserId, participantReferenceType, participantReferenceId) => {
    if (normalizeUpper(participantReferenceType) !== EMPLOYEE_PARTICIPANT_REFERENCE_TYPE) {
        return false;
    }
    const participantEmployeeId = Number(participantReferenceId);
    if (!Number.isInteger(participantEmployeeId) || participantEmployeeId <= 0) {
        return false;
    }
    const employeeIds = await buildDirectSbuSubPicParticipantEmployeeIds(requesterUserId);
    return employeeIds.has(participantEmployeeId);
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
const parseWorkspaceExamSelectionMetadata = (note) => {
    const normalizedNote = normalizeNote(note);
    if (!normalizedNote) {
        return {
            mode: "ALL",
            selectedQuestionIds: [],
        };
    }
    try {
        const parsed = JSON.parse(normalizedNote);
        const selectedQuestionIds = Array.isArray(parsed.selectedQuestionIds)
            ? Array.from(new Set(parsed.selectedQuestionIds
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)))
            : [];
        return {
            mode: parsed.mode === "SELECTED" && selectedQuestionIds.length > 0 ? "SELECTED" : "ALL",
            selectedQuestionIds,
        };
    }
    catch {
        return {
            mode: "ALL",
            selectedQuestionIds: [],
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
const buildWorkspaceExamSummaries = (stageExams, examNameMap, questionsByExam, questionTypeMap) => stageExams.map((stageExam) => {
    const selection = parseWorkspaceExamSelectionMetadata(stageExam.note);
    const sourceQuestions = questionsByExam.get(stageExam.examId) ?? [];
    const selectedQuestionSet = new Set(selection.selectedQuestionIds);
    const selectedQuestions = selection.mode === "SELECTED" && selectedQuestionSet.size > 0
        ? sourceQuestions.filter((question) => selectedQuestionSet.has(question.id))
        : sourceQuestions;
    const questionsToUse = selectedQuestions.length > 0 ? selectedQuestions : sourceQuestions;
    const questionTypes = Array.from(new Set(questionsToUse.map((question) => {
        const typeName = question.question_type != null
            ? questionTypeMap.get(question.question_type)
            : null;
        return normalizeNote(typeName) ?? "Pilihan ganda";
    })));
    return {
        onboardingStageExamId: stageExam.onboardingStageExamId,
        examId: stageExam.examId,
        examName: examNameMap.get(stageExam.examId) ?? `Ujian ${stageExam.examId}`,
        passScore: stageExam.passScore,
        orderIndex: stageExam.orderIndex,
        questionCount: questionsToUse.length,
        durationSeconds: questionsToUse.reduce((sum, question) => sum + Math.max(0, Number.isFinite(question.time_limit) ? question.time_limit : 0), 0),
        questionTypes,
    };
});
const buildMaterialProgressKey = (onboardingStageMaterialId, sourceFileId) => `${onboardingStageMaterialId}:${Number(sourceFileId ?? 0)}`;
const resolveSelectedSourceFileIds = (sourceFileIds, note) => {
    const metadata = parseWorkspaceSelectionMetadata(note);
    if (metadata.mode !== "SELECTED") {
        return sourceFileIds;
    }
    const selectedFileIds = new Set(metadata.selectedFileIds);
    const filtered = sourceFileIds.filter((sourceFileId) => selectedFileIds.has(sourceFileId));
    return filtered.length > 0 ? filtered : sourceFileIds;
};
const hasMaterialReadSignal = (progress) => Boolean(progress &&
    (normalizeUpper(progress.status) === "COMPLETED" ||
        progress.readAt ||
        progress.lastReadAt ||
        progress.completedAt ||
        Number(progress.openCount ?? 0) > 0));
const areStageMaterialsReadyForExam = (params) => {
    const progressMap = new Map(params.materialProgresses.map((progress) => [
        buildMaterialProgressKey(progress.onboardingStageMaterialId, progress.sourceFileId),
        progress,
    ]));
    return params.stageMaterials.every((stageMaterial) => {
        const sourceFileIds = params.sourceMaterialMap
            .get(stageMaterial.materiId)
            ?.files.map((file) => file.id) ?? [];
        const selectedFileIds = resolveSelectedSourceFileIds(sourceFileIds, stageMaterial.note);
        if (selectedFileIds.length === 0) {
            return true;
        }
        return selectedFileIds.every((sourceFileId) => hasMaterialReadSignal(progressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, sourceFileId))));
    });
};
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
        employeeName: recipientName,
        portalName: params.portalName,
        portalKey: params.portalKey,
        cardNumber,
        username,
        temporaryPassword: params.temporaryPassword ||
            (params.allowStoredPasswordFallback === false
                ? ""
                : resolveTemporaryPassword(params.employee.Password)),
        deadlineDays: params.durationDay,
        dueDate: params.dueAt.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
        startedDate: params.startedAt
            ? params.startedAt.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            })
            : "",
        loginUrl: resolveOmsLoginUrl(),
        supportName: resolveSupportName(),
        supportPhone: resolveSupportPhone(),
    };
};
const formatIndonesianDate = (value) => value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});
const formatIndonesianDateTime = (value) => value.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
const resolveHrdDecisionUrl = () => {
    const loginUrl = resolveOmsLoginUrl();
    if (/\/login$/i.test(loginUrl)) {
        return loginUrl.replace(/\/login$/i, "/employee");
    }
    return `${loginUrl.replace(/\/+$/, "")}/employee`;
};
const buildSbuSubPicOnboardingNotificationContext = (params) => {
    const cardNumber = normalizeNote(params.employee.CardNo) ?? String(params.employee.UserId);
    const employeeName = normalizeNote(params.employee.Name) ?? `Employee ${params.employee.UserId}`;
    return {
        recipientName: params.recipient.recipientName,
        employeeName,
        cardNumber,
        portalName: params.portalName,
        portalKey: params.portalKey,
        deadlineDays: params.durationDay,
        startedDate: formatIndonesianDate(params.startedAt),
        dueDate: formatIndonesianDate(params.dueAt),
        sbuSubName: params.recipient.sbuSubName,
        sbuName: params.recipient.sbuName ?? "",
        pilarName: params.recipient.pilarName ?? "",
        positionName: params.recipient.positionNames.join(", "),
        jabatanName: params.recipient.jabatanNames.join(", "),
        hrdUrl: resolveHrdDecisionUrl(),
        loginUrl: resolveOmsLoginUrl(),
        supportName: resolveSupportName(),
        supportPhone: resolveSupportPhone(),
    };
};
const groupSbuSubPicRecipientsByEmployee = (recipients) => {
    const grouped = new Map();
    for (const recipient of recipients) {
        const existing = grouped.get(recipient.employeeUserId) ?? [];
        existing.push(recipient);
        grouped.set(recipient.employeeUserId, existing);
    }
    return grouped;
};
const getOnboardingDecisionLabel = (decisionType) => {
    switch (normalizeUpper(decisionType)) {
        case DECISION_PASS_OVERRIDE:
            return "Diluluskan OMS";
        case DECISION_EXTEND:
            return "Onboarding diulang/diperpanjang";
        case DECISION_FAIL_FINAL:
            return "Gagal onboarding final";
        case DECISION_FREEZE_TRANSFER_REVIEW:
            return "Dibekukan untuk review HRD";
        case DECISION_CANCEL_TRANSFER_REVIEW:
            return "Bekukan onboarding dibatalkan";
        case AUTO_FAILED_DECISION_TYPE:
            return "Gagal otomatis karena melewati tenggat";
        default:
            return decisionType;
    }
};
const getOnboardingPicDecisionHrdTemplate = (decisionType) => {
    switch (normalizeUpper(decisionType)) {
        case DECISION_PASS_OVERRIDE:
            return [
                "[Info Keputusan PIC SBU Sub]",
                "PIC {decisionActorName} ({decisionActorBadge}) meluluskan onboarding {employeeName} ({cardNumber}) di {portalName}.",
                "Status saat ini: {status}.",
                "Catatan PIC: {decisionNote}.",
                "HRD menerima notifikasi ini untuk monitoring. Keputusan dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
        case DECISION_EXTEND:
            return [
                "[Info Keputusan PIC SBU Sub]",
                "PIC {decisionActorName} ({decisionActorBadge}) meminta {employeeName} ({cardNumber}) mengulang onboarding {portalName} selama {nextDurationDay} hari.",
                "Deadline baru: {dueDate}.",
                "Catatan PIC: {decisionNote}.",
                "HRD menerima notifikasi ini untuk monitoring. Keputusan dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
        case DECISION_FREEZE_TRANSFER_REVIEW:
            return [
                "[Onboarding Dibekukan oleh PIC SBU Sub]",
                "PIC {decisionActorName} ({decisionActorBadge}) membekukan onboarding {employeeName} ({cardNumber}) di {portalName}.",
                "Status beku ini tidak menonaktifkan akun peserta. Peserta masih bisa login OMS.",
                "Catatan/alasan PIC: {decisionNote}.",
                "HRD wajib mengetahui untuk review lanjutan, tetapi keputusan beku dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
        case DECISION_CANCEL_TRANSFER_REVIEW:
            return [
                "[Beku Onboarding Dibatalkan]",
                "PIC {decisionActorName} ({decisionActorBadge}) membatalkan status beku onboarding {employeeName} ({cardNumber}) di {portalName}.",
                "Status saat ini: {status}. Peserta kembali melanjutkan onboarding.",
                "Catatan PIC: {decisionNote}.",
                "HRD menerima notifikasi ini untuk monitoring. Keputusan pembatalan dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
        case DECISION_FAIL_FINAL:
            return [
                "[Gagal Onboarding Final]",
                "PIC {decisionActorName} ({decisionActorBadge}) menggagalkan onboarding {employeeName} ({cardNumber}) di {portalName}.",
                "Akun employee dinonaktifkan dan peserta tidak bisa login OMS.",
                "Alasan PIC: {decisionNote}.",
                "HRD menerima notifikasi ini untuk monitoring. Keputusan dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
        default:
            return [
                "[Info Keputusan PIC SBU Sub]",
                "PIC {decisionActorName} ({decisionActorBadge}) mengambil keputusan onboarding untuk {employeeName} ({cardNumber}) di {portalName}: {decisionLabel}.",
                "Status saat ini: {status}. Deadline: {dueDate}.",
                "Catatan PIC: {decisionNote}.",
                "HRD menerima notifikasi ini untuk monitoring. Keputusan dibuat oleh PIC SBU Sub.",
                "Detail: {decisionUrl}",
            ].join("\n");
    }
};
const parseConfiguredHrdNotificationUserIds = () => Array.from(new Set([
    process.env.ONBOARDING_HRD_NOTIFY_USER_IDS,
    process.env.ONBOARDING_HRD_NOTIFY_USER_ID,
    process.env.ONBOARDING_EXAM_MONITOR_USER_IDS,
    process.env.ONBOARDING_EXAM_MONITOR_USER_ID,
]
    .flatMap((value) => (value ?? "").split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)));
const resolveHrdNotificationRecipients = async () => {
    const configuredUserIds = parseConfiguredHrdNotificationUserIds();
    const configuredEmployeeIds = configuredUserIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
    const hrdMaster = await prismaFlowly.masterAccessRole.findUnique({
        where: {
            resourceType_resourceKey: {
                resourceType: "MENU",
                resourceKey: "HRD",
            },
        },
        select: {
            masAccessId: true,
        },
    });
    const accessRoles = configuredUserIds.length === 0
        ? await prismaFlowly.accessRole.findMany({
            where: {
                isDeleted: false,
                isActive: true,
                resourceType: "MENU",
                ...(hrdMaster
                    ? {
                        OR: [
                            { resourceKey: "HRD" },
                            { masAccessId: hrdMaster.masAccessId },
                        ],
                    }
                    : { resourceKey: "HRD" }),
            },
            select: {
                subjectType: true,
                subjectId: true,
            },
        })
        : [];
    const hrdRoleIds = Array.from(new Set(accessRoles
        .filter((access) => normalizeUpper(access.subjectType) === "ROLE")
        .map((access) => access.subjectId)));
    const hrdUserIds = Array.from(new Set(accessRoles
        .filter((access) => normalizeUpper(access.subjectType) === "USER")
        .map((access) => access.subjectId)));
    const flowlyUsers = configuredUserIds.length > 0
        ? await prismaFlowly.user.findMany({
            where: {
                userId: { in: configuredUserIds },
                isActive: true,
                isDeleted: false,
            },
            select: {
                userId: true,
                name: true,
                badgeNumber: true,
            },
        })
        : await prismaFlowly.user.findMany({
            where: {
                isActive: true,
                isDeleted: false,
                OR: [
                    {
                        role: {
                            roleLevel: 1,
                        },
                    },
                    ...(hrdRoleIds.length > 0 ? [{ roleId: { in: hrdRoleIds } }] : []),
                    ...(hrdUserIds.length > 0 ? [{ userId: { in: hrdUserIds } }] : []),
                ],
            },
            select: {
                userId: true,
                name: true,
                badgeNumber: true,
            },
        });
    const flowlyNumericUserIds = flowlyUsers
        .map((user) => Number(user.userId))
        .filter((value) => Number.isInteger(value) && value > 0);
    const flowlyBadgeNumbers = flowlyUsers
        .map((user) => normalizeNote(user.badgeNumber))
        .filter((value) => Boolean(value));
    const employeeIds = Array.from(new Set([...configuredEmployeeIds, ...flowlyNumericUserIds]));
    const employeeWhere = [
        ...(employeeIds.length > 0 ? [{ UserId: { in: employeeIds } }] : []),
        ...(flowlyBadgeNumbers.length > 0
            ? [
                { CardNo: { in: flowlyBadgeNumbers } },
                { BadgeNum: { in: flowlyBadgeNumbers } },
            ]
            : []),
    ];
    const employees = employeeWhere.length > 0
        ? await prismaEmployee.em_employee.findMany({
            where: {
                OR: employeeWhere,
            },
            select: {
                UserId: true,
                CardNo: true,
                BadgeNum: true,
                Name: true,
                Phone: true,
                email: true,
            },
        })
        : [];
    const employeeByUserId = new Map(employees.map((employee) => [employee.UserId, employee]));
    const employeeByCardNumber = new Map();
    for (const employee of employees) {
        const cardNumber = normalizeNote(employee.CardNo);
        const badgeNumber = normalizeNote(employee.BadgeNum);
        if (cardNumber) {
            employeeByCardNumber.set(cardNumber, employee);
        }
        if (badgeNumber) {
            employeeByCardNumber.set(badgeNumber, employee);
        }
    }
    const recipientMap = new Map();
    for (const employeeId of configuredEmployeeIds) {
        const employee = employeeByUserId.get(employeeId);
        if (employee) {
            recipientMap.set(employee.UserId, {
                userId: employee.UserId,
                recipientName: normalizeNote(employee.Name) ?? `HRD ${employee.UserId}`,
                phoneNumber: normalizePhone(employee.Phone),
                email: normalizeEmail(employee.email),
            });
        }
    }
    for (const user of flowlyUsers) {
        const numericUserId = Number(user.userId);
        const employee = (Number.isInteger(numericUserId) && numericUserId > 0
            ? employeeByUserId.get(numericUserId)
            : null) ??
            (normalizeNote(user.badgeNumber)
                ? employeeByCardNumber.get(normalizeNote(user.badgeNumber))
                : null);
        if (!employee) {
            continue;
        }
        recipientMap.set(employee.UserId, {
            userId: employee.UserId,
            recipientName: normalizeNote(employee.Name) ?? normalizeNote(user.name) ?? `HRD ${employee.UserId}`,
            phoneNumber: normalizePhone(employee.Phone),
            email: normalizeEmail(employee.email),
        });
    }
    return Array.from(recipientMap.values());
};
const enqueueOnboardingOverdueNotification = async (params) => {
    try {
        const recipients = await resolveHrdNotificationRecipients();
        if (recipients.length === 0) {
            logger.warn("No HRD recipients available for onboarding overdue notification", {
                onboardingAssignmentId: params.assignment.onboardingAssignmentId,
            });
            return;
        }
        const existing = await prismaFlowly.notificationOutbox.findMany({
            where: {
                eventKey: ONBOARDING_OVERDUE_FAILED_EVENT_KEY,
                recipientRole: HRD_RECIPIENT_ROLE,
                contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
                contextReferenceId: params.assignment.onboardingAssignmentId,
                isDeleted: false,
            },
            select: {
                recipientReferenceId: true,
            },
        });
        const existingRecipientIds = new Set(existing.map((item) => Number(item.recipientReferenceId)));
        const nextRecipients = recipients.filter((recipient) => !existingRecipientIds.has(recipient.userId));
        if (nextRecipients.length === 0) {
            return;
        }
        const templates = await resolveRuntimeNotificationTemplates({
            portalKey: params.assignment.portalKey,
            eventKey: ONBOARDING_OVERDUE_FAILED_EVENT_KEY,
            recipientRole: HRD_RECIPIENT_ROLE,
        });
        const fallbackTemplate = {
            notificationTemplateId: null,
            channel: CHANNEL_WHATSAPP,
            messageTemplate: "Onboarding {employeeName} ({cardNumber}) untuk {portalName} gagal otomatis karena melewati tenggat {dueDate}. HRD perlu memberi keputusan di {decisionUrl}.",
        };
        const notificationTemplates = templates.length > 0
            ? templates.map((template) => ({
                notificationTemplateId: template.notificationTemplateId,
                channel: template.channel,
                messageTemplate: template.messageTemplate,
            }))
            : [fallbackTemplate];
        const createNotificationOutboxId = await generateNotificationOutboxId();
        const employeeName = normalizeNote(params.employee?.Name) ??
            `Employee ${params.assignment.participantReferenceId}`;
        const cardNumber = normalizeNote(params.employee?.CardNo) ??
            normalizeNote(params.employee?.BadgeNum) ??
            params.assignment.participantReferenceId;
        const portalName = normalizeNote(params.assignment.portalTemplate?.portalName) ??
            normalizePortalKey(params.assignment.portalKey);
        const dueDate = formatIndonesianDate(params.assignment.dueAt);
        const decisionUrl = resolveHrdDecisionUrl();
        const outboxes = [];
        for (const recipient of nextRecipients) {
            for (const template of notificationTemplates) {
                const channel = normalizeUpper(template.channel);
                const context = {
                    recipientName: recipient.recipientName,
                    employeeName,
                    cardNumber,
                    portalName,
                    portalKey: params.assignment.portalKey,
                    dueDate,
                    failedAt: formatIndonesianDate(params.failedAt),
                    decisionUrl,
                    supportName: resolveSupportName(),
                    supportPhone: resolveSupportPhone(),
                };
                const phoneNumber = channel === CHANNEL_WHATSAPP ? recipient.phoneNumber ?? "" : "";
                const email = channel === CHANNEL_EMAIL ? recipient.email ?? "" : recipient.email;
                if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
                    logger.warn("Skipping HRD onboarding overdue notification without phone", {
                        onboardingAssignmentId: params.assignment.onboardingAssignmentId,
                        recipientUserId: recipient.userId,
                    });
                    continue;
                }
                outboxes.push({
                    notificationOutboxId: createNotificationOutboxId(),
                    notificationTemplateId: template.notificationTemplateId,
                    portalKey: params.assignment.portalKey,
                    eventKey: ONBOARDING_OVERDUE_FAILED_EVENT_KEY,
                    recipientRole: HRD_RECIPIENT_ROLE,
                    recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                    recipientReferenceId: String(recipient.userId),
                    contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
                    contextReferenceId: params.assignment.onboardingAssignmentId,
                    phoneNumber,
                    message: trimMessage(renderTemplate(template.messageTemplate, context)),
                    status: "PENDING",
                    attempts: 0,
                    lastError: null,
                    provider: null,
                    sentAt: null,
                    meta: JSON.stringify({
                        channel,
                        email,
                        employeeName,
                        cardNumber,
                        portalKey: params.assignment.portalKey,
                        portalName,
                        dueDate,
                        decisionUrl,
                    }),
                    isActive: true,
                    isDeleted: false,
                    createdAt: params.failedAt,
                    createdBy: "SYSTEM",
                    updatedAt: params.failedAt,
                    updatedBy: "SYSTEM",
                    deletedAt: null,
                    deletedBy: null,
                });
            }
        }
        if (outboxes.length === 0) {
            return;
        }
        await prismaFlowly.notificationOutbox.createMany({
            data: outboxes,
        });
    }
    catch (error) {
        logger.warn("Failed to enqueue onboarding overdue notification", {
            onboardingAssignmentId: params.assignment.onboardingAssignmentId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
const enqueueOnboardingPicDecisionNotification = async (params) => {
    try {
        const recipients = await resolveHrdNotificationRecipients();
        if (recipients.length === 0) {
            logger.warn("No HRD recipients available for onboarding PIC decision notification", {
                onboardingAssignmentId: params.assignment.onboardingAssignmentId,
                onboardingDecisionId: params.onboardingDecisionId,
            });
            return;
        }
        const existing = await prismaFlowly.notificationOutbox.findMany({
            where: {
                eventKey: ONBOARDING_PIC_DECISION_EVENT_KEY,
                recipientRole: HRD_RECIPIENT_ROLE,
                contextReferenceType: ONBOARDING_DECISION_CONTEXT_TYPE,
                contextReferenceId: params.onboardingDecisionId,
                isDeleted: false,
            },
            select: {
                recipientReferenceId: true,
            },
        });
        const existingRecipientIds = new Set(existing.map((item) => Number(item.recipientReferenceId)));
        const nextRecipients = recipients.filter((recipient) => !existingRecipientIds.has(recipient.userId));
        if (nextRecipients.length === 0) {
            return;
        }
        const notificationTemplates = [
            {
                notificationTemplateId: null,
                channel: CHANNEL_WHATSAPP,
                messageTemplate: getOnboardingPicDecisionHrdTemplate(params.decisionType),
            },
        ];
        const requesterEmployeeId = await resolveRequesterEmployeeId(params.decidedByUserId);
        const [decisionActorEmployee, decisionActorUser] = await Promise.all([
            requesterEmployeeId
                ? prismaEmployee.em_employee.findUnique({
                    where: { UserId: requesterEmployeeId },
                    select: {
                        UserId: true,
                        CardNo: true,
                        BadgeNum: true,
                        Name: true,
                    },
                })
                : null,
            prismaFlowly.user.findUnique({
                where: { userId: params.decidedByUserId },
                select: {
                    userId: true,
                    name: true,
                    badgeNumber: true,
                },
            }),
        ]);
        const createNotificationOutboxId = await generateNotificationOutboxId();
        const employeeName = normalizeNote(params.employee?.Name) ??
            `Employee ${params.assignment.participantReferenceId}`;
        const cardNumber = normalizeNote(params.employee?.CardNo) ??
            normalizeNote(params.employee?.BadgeNum) ??
            params.assignment.participantReferenceId;
        const portalName = normalizeNote(params.assignment.portalTemplate?.portalName) ??
            normalizePortalKey(params.assignment.portalKey);
        const decisionActorName = normalizeNote(decisionActorEmployee?.Name) ??
            normalizeNote(decisionActorUser?.name) ??
            `PIC ${params.decidedByUserId}`;
        const decisionActorBadge = normalizeNote(decisionActorEmployee?.CardNo) ??
            normalizeNote(decisionActorEmployee?.BadgeNum) ??
            normalizeNote(decisionActorUser?.badgeNumber) ??
            params.decidedByUserId;
        const decisionLabel = getOnboardingDecisionLabel(params.decisionType);
        const decisionUrl = resolveHrdDecisionUrl();
        const decisionNote = params.note ?? "-";
        const outboxes = [];
        for (const recipient of nextRecipients) {
            for (const template of notificationTemplates) {
                const channel = normalizeUpper(template.channel);
                const context = {
                    recipientName: recipient.recipientName,
                    employeeName,
                    cardNumber,
                    portalName,
                    portalKey: params.assignment.portalKey,
                    decisionLabel,
                    decisionType: params.decisionType,
                    status: params.nextStatus,
                    dueDate: formatIndonesianDate(params.nextDueAt),
                    nextDurationDay: params.nextDurationDay ?? "",
                    decisionNote,
                    decisionAt: formatIndonesianDateTime(params.decidedAt),
                    decisionActorName,
                    decisionActorBadge,
                    decisionUrl,
                    supportName: resolveSupportName(),
                    supportPhone: resolveSupportPhone(),
                };
                const phoneNumber = channel === CHANNEL_WHATSAPP ? recipient.phoneNumber ?? "" : "";
                const email = channel === CHANNEL_EMAIL ? recipient.email ?? "" : recipient.email;
                if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
                    logger.warn("Skipping HRD onboarding PIC decision notification without phone", {
                        onboardingAssignmentId: params.assignment.onboardingAssignmentId,
                        onboardingDecisionId: params.onboardingDecisionId,
                        recipientUserId: recipient.userId,
                    });
                    continue;
                }
                outboxes.push({
                    notificationOutboxId: createNotificationOutboxId(),
                    notificationTemplateId: template.notificationTemplateId,
                    portalKey: params.assignment.portalKey,
                    eventKey: ONBOARDING_PIC_DECISION_EVENT_KEY,
                    recipientRole: HRD_RECIPIENT_ROLE,
                    recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                    recipientReferenceId: String(recipient.userId),
                    contextReferenceType: ONBOARDING_DECISION_CONTEXT_TYPE,
                    contextReferenceId: params.onboardingDecisionId,
                    phoneNumber,
                    message: trimMessage(renderTemplate(template.messageTemplate, context)),
                    status: "PENDING",
                    attempts: 0,
                    lastError: null,
                    provider: null,
                    sentAt: null,
                    meta: JSON.stringify({
                        channel,
                        email,
                        onboardingAssignmentId: params.assignment.onboardingAssignmentId,
                        onboardingDecisionId: params.onboardingDecisionId,
                        employeeName,
                        cardNumber,
                        portalKey: params.assignment.portalKey,
                        portalName,
                        decisionType: params.decisionType,
                        decisionLabel,
                        status: params.nextStatus,
                        dueDate: context.dueDate,
                        nextDurationDay: params.nextDurationDay,
                        decisionNote,
                        decisionAt: context.decisionAt,
                        decisionActorName,
                        decisionActorBadge,
                        decisionUrl,
                    }),
                    isActive: true,
                    isDeleted: false,
                    createdAt: params.decidedAt,
                    createdBy: params.decidedByUserId.slice(0, 20),
                    updatedAt: params.decidedAt,
                    updatedBy: params.decidedByUserId.slice(0, 20),
                    deletedAt: null,
                    deletedBy: null,
                });
            }
        }
        if (outboxes.length === 0) {
            return;
        }
        await prismaFlowly.notificationOutbox.createMany({
            data: outboxes,
        });
    }
    catch (error) {
        logger.warn("Failed to enqueue onboarding PIC decision notification", {
            onboardingAssignmentId: params.assignment.onboardingAssignmentId,
            onboardingDecisionId: params.onboardingDecisionId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
const deactivateEmployeeAccountForFailedOnboarding = async (params) => {
    if (normalizeUpper(params.assignment.participantReferenceType) !==
        EMPLOYEE_PARTICIPANT_REFERENCE_TYPE) {
        return;
    }
    const employeeUserId = Number(params.assignment.participantReferenceId);
    if (!Number.isInteger(employeeUserId) || employeeUserId <= 0) {
        logger.warn("Skipping failed onboarding employee deactivation with invalid id", {
            onboardingAssignmentId: params.assignment.onboardingAssignmentId,
            participantReferenceId: params.assignment.participantReferenceId,
        });
        return;
    }
    const updateResult = await prismaEmployee.em_employee.updateMany({
        where: {
            UserId: employeeUserId,
        },
        data: {
            status: "I",
            statusLMS: false,
            Lastupdate: params.updatedAt,
        },
    });
    if (updateResult.count === 0) {
        logger.warn("Failed onboarding employee account was not found to deactivate", {
            onboardingAssignmentId: params.assignment.onboardingAssignmentId,
            employeeUserId,
        });
    }
};
const resolveSbuSubPicOnboardingRecipients = async (userIds) => {
    const normalizedUserIds = Array.from(new Set(userIds.filter((userId) => Number.isInteger(userId) && userId > 0)));
    if (normalizedUserIds.length === 0) {
        return [];
    }
    const chartMembers = await prismaFlowly.chartMember.findMany({
        where: {
            userId: { in: normalizedUserIds },
            isDeleted: false,
            node: { isDeleted: false },
        },
        orderBy: [{ chartId: "asc" }, { memberChartId: "asc" }],
        select: {
            userId: true,
            jabatan: true,
            node: {
                select: {
                    chartId: true,
                    position: true,
                    pilarId: true,
                    sbuId: true,
                    sbuSubId: true,
                },
            },
        },
    });
    if (chartMembers.length === 0) {
        return [];
    }
    const sbuSubIds = Array.from(new Set(chartMembers
        .map((member) => member.node.sbuSubId)
        .filter((value) => Number.isInteger(value) && value > 0)));
    const sbuSubs = sbuSubIds.length > 0
        ? await prismaEmployee.em_sbu_sub.findMany({
            where: {
                id: { in: sbuSubIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: {
                id: true,
                sbu_sub_name: true,
                sbu_id: true,
                sbu_pilar: true,
                pic: true,
            },
        })
        : [];
    const sbuSubById = new Map(sbuSubs.map((item) => [item.id, item]));
    const picUserIds = Array.from(new Set(sbuSubs
        .map((item) => item.pic)
        .filter((value) => value !== null && value !== undefined && Number.isInteger(value) && value > 0)));
    if (picUserIds.length === 0) {
        return [];
    }
    const sbuIds = Array.from(new Set([
        ...chartMembers.map((member) => member.node.sbuId),
        ...sbuSubs.map((item) => item.sbu_id),
    ].filter((value) => value !== null && value !== undefined && Number.isInteger(value) && value > 0)));
    const pilarIds = Array.from(new Set([
        ...chartMembers.map((member) => member.node.pilarId),
        ...sbuSubs.map((item) => item.sbu_pilar),
    ].filter((value) => value !== null && value !== undefined && Number.isInteger(value) && value > 0)));
    const [picEmployees, sbus, pilars] = await Promise.all([
        prismaEmployee.em_employee.findMany({
            where: {
                UserId: { in: picUserIds },
            },
            select: {
                UserId: true,
                Name: true,
                Phone: true,
                email: true,
            },
        }),
        sbuIds.length > 0
            ? prismaEmployee.em_sbu.findMany({
                where: { id: { in: sbuIds } },
                select: { id: true, sbu_name: true },
            })
            : [],
        pilarIds.length > 0
            ? prismaEmployee.em_pilar.findMany({
                where: { id: { in: pilarIds } },
                select: { id: true, pilar_name: true },
            })
            : [],
    ]);
    const picEmployeeById = new Map(picEmployees.map((employee) => [employee.UserId, employee]));
    const sbuNameById = new Map(sbus.map((sbu) => [sbu.id, normalizeNote(sbu.sbu_name)]));
    const pilarNameById = new Map(pilars.map((pilar) => [pilar.id, normalizeNote(pilar.pilar_name)]));
    const recipientMap = new Map();
    for (const member of chartMembers) {
        if (!member.userId) {
            continue;
        }
        const sbuSub = sbuSubById.get(member.node.sbuSubId);
        const recipientUserId = sbuSub?.pic;
        if (!sbuSub ||
            !recipientUserId ||
            recipientUserId === member.userId ||
            !Number.isInteger(recipientUserId)) {
            continue;
        }
        const picEmployee = picEmployeeById.get(recipientUserId);
        if (!picEmployee) {
            continue;
        }
        const sbuId = sbuSub.sbu_id ?? member.node.sbuId;
        const pilarId = sbuSub.sbu_pilar ?? member.node.pilarId;
        const key = `${member.userId}|${recipientUserId}|${sbuSub.id}`;
        const existing = recipientMap.get(key);
        const positionName = normalizeNote(member.node.position) ?? `Chart ${member.node.chartId}`;
        const jabatanName = normalizeNote(member.jabatan);
        if (existing) {
            existing.positionNameSet.add(positionName);
            if (jabatanName) {
                existing.jabatanNameSet.add(jabatanName);
            }
            existing.positionNames = Array.from(existing.positionNameSet);
            existing.jabatanNames = Array.from(existing.jabatanNameSet);
            continue;
        }
        const positionNameSet = new Set([positionName]);
        const jabatanNameSet = new Set();
        if (jabatanName) {
            jabatanNameSet.add(jabatanName);
        }
        recipientMap.set(key, {
            employeeUserId: member.userId,
            recipientUserId,
            recipientName: normalizeNote(picEmployee.Name) ?? `PIC SBU Sub ${recipientUserId}`,
            phoneNumber: normalizePhone(picEmployee.Phone),
            email: normalizeEmail(picEmployee.email),
            sbuSubId: sbuSub.id,
            sbuSubName: normalizeNote(sbuSub.sbu_sub_name) ?? `SBU Sub ${sbuSub.id}`,
            sbuName: sbuId !== null && sbuId !== undefined
                ? sbuNameById.get(sbuId) ?? null
                : null,
            pilarName: pilarId !== null && pilarId !== undefined
                ? pilarNameById.get(pilarId) ?? null
                : null,
            positionNames: Array.from(positionNameSet),
            jabatanNames: Array.from(jabatanNameSet),
            positionNameSet,
            jabatanNameSet,
        });
    }
    return Array.from(recipientMap.values())
        .map(({ positionNameSet: _positionNameSet, jabatanNameSet: _jabatanNameSet, ...item }) => item)
        .sort((left, right) => {
        if (left.employeeUserId !== right.employeeUserId) {
            return left.employeeUserId - right.employeeUserId;
        }
        return left.sbuSubName.localeCompare(right.sbuSubName);
    });
};
const buildEmployeeOnboardingPlacementMap = async (userIds) => {
    const normalizedUserIds = Array.from(new Set(userIds.filter((userId) => Number.isInteger(userId) && userId > 0)));
    if (normalizedUserIds.length === 0) {
        return new Map();
    }
    const mutablePlacementMap = new Map();
    const getMutablePlacement = (userId) => {
        const existing = mutablePlacementMap.get(userId);
        if (existing) {
            return existing;
        }
        const next = {
            sources: new Set(),
            details: [],
            detailKeys: new Set(),
        };
        mutablePlacementMap.set(userId, next);
        return next;
    };
    const addPlacementDetail = (userId, source, detail) => {
        if (!userId || !Number.isInteger(userId)) {
            return;
        }
        const normalizedLabel = normalizeNote(detail.label) ??
            joinPlacementFields([
                ["Role", detail.roleLabel],
                ["Posisi", detail.positionName],
                ["Jabatan", detail.jabatanName],
                ["SBU Sub", detail.sbuSubName],
                ["PIC SBU Sub", detail.sbuSubPicName],
                ["SBU", detail.sbuName],
                ["Pilar", detail.pilarName],
            ]);
        if (!normalizedLabel) {
            return;
        }
        const placement = getMutablePlacement(userId);
        const detailKey = `${source}|${normalizedLabel}`;
        placement.sources.add(source);
        if (!placement.detailKeys.has(detailKey)) {
            placement.detailKeys.add(detailKey);
            placement.details.push({
                source,
                label: normalizedLabel,
                roleLabel: detail.roleLabel,
                positionName: detail.positionName,
                jabatanName: detail.jabatanName,
                pilarName: detail.pilarName,
                sbuName: detail.sbuName,
                sbuSubName: detail.sbuSubName,
                sbuSubPicName: detail.sbuSubPicName,
            });
        }
    };
    const [chartMembers, pilarPics, sbuPics, sbuSubPics] = await Promise.all([
        prismaFlowly.chartMember.findMany({
            where: {
                userId: { in: normalizedUserIds },
                isDeleted: false,
                node: { isDeleted: false },
            },
            orderBy: [{ chartId: "asc" }, { memberChartId: "asc" }],
            select: {
                userId: true,
                jabatan: true,
                node: {
                    select: {
                        chartId: true,
                        position: true,
                        pilarId: true,
                        sbuId: true,
                        sbuSubId: true,
                    },
                },
            },
        }),
        prismaEmployee.em_pilar.findMany({
            where: {
                pic: { in: normalizedUserIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            orderBy: [{ pilar_name: "asc" }],
            select: { id: true, pilar_name: true, pic: true },
        }),
        prismaEmployee.em_sbu.findMany({
            where: {
                pic: { in: normalizedUserIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            orderBy: [{ sbu_name: "asc" }],
            select: { id: true, sbu_name: true, sbu_pilar: true, pic: true },
        }),
        prismaEmployee.em_sbu_sub.findMany({
            where: {
                pic: { in: normalizedUserIds },
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            orderBy: [{ sbu_sub_name: "asc" }],
            select: {
                id: true,
                sbu_sub_name: true,
                sbu_id: true,
                sbu_pilar: true,
                pic: true,
            },
        }),
    ]);
    const pilarIds = Array.from(new Set([
        ...chartMembers.map((member) => member.node.pilarId),
        ...pilarPics.map((pilar) => pilar.id),
        ...sbuPics.map((sbu) => sbu.sbu_pilar),
        ...sbuSubPics.map((sbuSub) => sbuSub.sbu_pilar),
    ].filter((value) => value !== null && value !== undefined && Number.isInteger(value))));
    const sbuIds = Array.from(new Set([
        ...chartMembers.map((member) => member.node.sbuId),
        ...sbuPics.map((sbu) => sbu.id),
        ...sbuSubPics.map((sbuSub) => sbuSub.sbu_id),
    ].filter((value) => value !== null && value !== undefined && Number.isInteger(value))));
    const sbuSubIds = Array.from(new Set([
        ...chartMembers.map((member) => member.node.sbuSubId),
        ...sbuSubPics.map((sbuSub) => sbuSub.id),
    ].filter((value) => value !== null && value !== undefined && Number.isInteger(value))));
    const [pilarNames, sbuNames, sbuSubNames] = await Promise.all([
        pilarIds.length > 0
            ? prismaEmployee.em_pilar.findMany({
                where: { id: { in: pilarIds } },
                select: { id: true, pilar_name: true },
            })
            : [],
        sbuIds.length > 0
            ? prismaEmployee.em_sbu.findMany({
                where: { id: { in: sbuIds } },
                select: { id: true, sbu_name: true },
            })
            : [],
        sbuSubIds.length > 0
            ? prismaEmployee.em_sbu_sub.findMany({
                where: { id: { in: sbuSubIds } },
                select: { id: true, sbu_sub_name: true, pic: true },
            })
            : [],
    ]);
    const pilarNameMap = new Map(pilarNames.map((pilar) => [pilar.id, normalizeNote(pilar.pilar_name)]));
    const sbuNameMap = new Map(sbuNames.map((sbu) => [sbu.id, normalizeNote(sbu.sbu_name)]));
    const sbuSubNameMap = new Map(sbuSubNames.map((sbuSub) => [
        sbuSub.id,
        normalizeNote(sbuSub.sbu_sub_name),
    ]));
    const sbuSubPicIds = Array.from(new Set(sbuSubNames
        .map((sbuSub) => sbuSub.pic)
        .filter((value) => value !== null &&
        value !== undefined &&
        Number.isInteger(value) &&
        value > 0)));
    const sbuSubPicEmployees = sbuSubPicIds.length > 0
        ? await prismaEmployee.em_employee.findMany({
            where: { UserId: { in: sbuSubPicIds } },
            select: { UserId: true, Name: true },
        })
        : [];
    const sbuSubPicEmployeeNameMap = new Map(sbuSubPicEmployees.map((employee) => [
        employee.UserId,
        normalizeNote(employee.Name),
    ]));
    const sbuSubPicNameMap = new Map(sbuSubNames.map((sbuSub) => [
        sbuSub.id,
        sbuSub.pic
            ? sbuSubPicEmployeeNameMap.get(sbuSub.pic) ?? `User ${sbuSub.pic}`
            : null,
    ]));
    const joinPlacementFields = (fields) => fields
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => `${label}: ${value}`)
        .join("; ");
    for (const member of chartMembers) {
        const pilarName = pilarNameMap.get(member.node.pilarId);
        const sbuName = sbuNameMap.get(member.node.sbuId);
        const sbuSubName = sbuSubNameMap.get(member.node.sbuSubId);
        const position = normalizeNote(member.node.position) ?? `Chart ${member.node.chartId}`;
        const jabatan = normalizeNote(member.jabatan);
        addPlacementDetail(member.userId, ONBOARDING_PLACEMENT_SOURCES.CHART_MEMBER, {
            roleLabel: "Staff struktur organisasi",
            positionName: position,
            jabatanName: jabatan,
            pilarName: pilarName ?? null,
            sbuName: sbuName ?? null,
            sbuSubName: sbuSubName ?? null,
            sbuSubPicName: sbuSubPicNameMap.get(member.node.sbuSubId) ?? null,
        });
    }
    for (const pilar of pilarPics) {
        addPlacementDetail(pilar.pic, ONBOARDING_PLACEMENT_SOURCES.PILAR_PIC, {
            roleLabel: "PIC Pilar",
            positionName: null,
            jabatanName: null,
            pilarName: normalizeNote(pilar.pilar_name) ?? `Pilar ${pilar.id}`,
            sbuName: null,
            sbuSubName: null,
            sbuSubPicName: null,
        });
    }
    for (const sbu of sbuPics) {
        const pilarName = sbu.sbu_pilar !== null && sbu.sbu_pilar !== undefined
            ? pilarNameMap.get(sbu.sbu_pilar)
            : null;
        addPlacementDetail(sbu.pic, ONBOARDING_PLACEMENT_SOURCES.SBU_PIC, {
            roleLabel: "PIC SBU",
            positionName: null,
            jabatanName: null,
            pilarName: pilarName ?? null,
            sbuName: normalizeNote(sbu.sbu_name) ?? `SBU ${sbu.id}`,
            sbuSubName: null,
            sbuSubPicName: null,
        });
    }
    for (const sbuSub of sbuSubPics) {
        const pilarName = sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined
            ? pilarNameMap.get(sbuSub.sbu_pilar)
            : null;
        const sbuName = sbuSub.sbu_id !== null && sbuSub.sbu_id !== undefined
            ? sbuNameMap.get(sbuSub.sbu_id)
            : null;
        addPlacementDetail(sbuSub.pic, ONBOARDING_PLACEMENT_SOURCES.SBU_SUB_PIC, {
            roleLabel: "PIC SBU Sub",
            positionName: null,
            jabatanName: null,
            pilarName: pilarName ?? null,
            sbuName: sbuName ?? null,
            sbuSubName: normalizeNote(sbuSub.sbu_sub_name) ?? `SBU Sub ${sbuSub.id}`,
            sbuSubPicName: null,
        });
    }
    return new Map(normalizedUserIds.map((userId) => {
        const placement = mutablePlacementMap.get(userId);
        const sources = Array.from(placement?.sources ?? []);
        return [
            userId,
            {
                hasOnboardingPlacement: sources.length > 0,
                sources,
                details: placement?.details ?? [],
            },
        ];
    }));
};
const getOnboardingPlacementInfo = (placementMap, userId) => placementMap.get(userId) ?? {
    hasOnboardingPlacement: false,
    sources: [],
    details: [],
};
const toSummaryResponse = (employeeNameMap, placementMap, assignment) => {
    const userId = Number(assignment.participantReferenceId);
    if (!Number.isFinite(userId) || userId <= 0) {
        return null;
    }
    const hasActiveAssignment = assignment.isActive && !isFinalAssignmentStatus(assignment.status);
    const normalizedStatus = normalizeUpper(assignment.status);
    const requiresDecision = normalizedStatus === "FAILED" ||
        normalizedStatus === ASSIGNMENT_STATUS_TRANSFER_REVIEW;
    const placement = getOnboardingPlacementInfo(placementMap, userId);
    return {
        userId,
        employeeName: employeeNameMap.get(userId) ?? null,
        onboardingAssignmentId: assignment.onboardingAssignmentId,
        portalKey: assignment.portalKey,
        status: assignment.status,
        startedAt: assignment.startedAt,
        dueAt: assignment.dueAt,
        failedAt: assignment.failedAt,
        currentStageOrder: assignment.currentStageOrder,
        hasActiveAssignment,
        canStart: placement.hasOnboardingPlacement &&
            !hasActiveAssignment &&
            !requiresDecision,
        requiresDecision,
        hasOnboardingPlacement: placement.hasOnboardingPlacement,
        onboardingPlacementSources: placement.sources,
        onboardingPlacementDetails: placement.details,
        onboardingBlockReason: placement.hasOnboardingPlacement
            ? null
            : ONBOARDING_PLACEMENT_REQUIRED_REASON,
    };
};
const toNotStartedEmployeeSummaryResponse = (portalKey, employee, placementMap) => {
    const placement = getOnboardingPlacementInfo(placementMap, employee.UserId);
    return {
        userId: employee.UserId,
        employeeName: employee.Name ?? null,
        onboardingAssignmentId: null,
        portalKey,
        status: null,
        startedAt: null,
        dueAt: null,
        failedAt: null,
        currentStageOrder: null,
        hasActiveAssignment: false,
        canStart: placement.hasOnboardingPlacement,
        requiresDecision: false,
        hasOnboardingPlacement: placement.hasOnboardingPlacement,
        onboardingPlacementSources: placement.sources,
        onboardingPlacementDetails: placement.details,
        onboardingBlockReason: placement.hasOnboardingPlacement
            ? null
            : ONBOARDING_PLACEMENT_REQUIRED_REASON,
    };
};
const hasOnboardingPlacement = (placementMap, userId) => getOnboardingPlacementInfo(placementMap, userId).hasOnboardingPlacement;
export class OnboardingService {
    static async expireOverdueAssignments(options = {}) {
        const now = new Date();
        const participantReferenceIds = Array.from(new Set((options.participantReferenceIds ?? [])
            .map((value) => value.trim())
            .filter((value) => value.length > 0)));
        const portalKeys = Array.from(new Set((options.portalKeys ?? [])
            .map((value) => normalizePortalKey(value))
            .filter((value) => value.length > 0)));
        const assignments = await prismaFlowly.onboardingAssignment.findMany({
            where: {
                programType: PROGRAM_TYPE_ONBOARDING,
                isDeleted: false,
                isActive: true,
                dueAt: {
                    lt: now,
                },
                status: {
                    notIn: Array.from(FINAL_ASSIGNMENT_STATUSES),
                },
                ...(participantReferenceIds.length > 0
                    ? { participantReferenceId: { in: participantReferenceIds } }
                    : {}),
                ...(portalKeys.length > 0 ? { portalKey: { in: portalKeys } } : {}),
            },
            include: {
                portalTemplate: {
                    select: {
                        portalName: true,
                    },
                },
                stageProgresses: {
                    where: {
                        isDeleted: false,
                        isActive: true,
                    },
                    orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
                    select: {
                        onboardingStageProgressId: true,
                        stageOrder: true,
                        status: true,
                    },
                },
            },
        });
        if (assignments.length === 0) {
            return { expired: 0 };
        }
        const employeeIds = assignments
            .filter((assignment) => normalizeUpper(assignment.participantReferenceType) ===
            EMPLOYEE_PARTICIPANT_REFERENCE_TYPE)
            .map((assignment) => Number(assignment.participantReferenceId))
            .filter((value) => Number.isInteger(value) && value > 0);
        const employees = employeeIds.length > 0
            ? await prismaEmployee.em_employee.findMany({
                where: {
                    UserId: {
                        in: Array.from(new Set(employeeIds)),
                    },
                },
                select: {
                    UserId: true,
                    CardNo: true,
                    BadgeNum: true,
                    Name: true,
                },
            })
            : [];
        const employeeMap = new Map(employees.map((employee) => [employee.UserId, employee]));
        const createDecisionId = await generateOnboardingDecisionId();
        let expired = 0;
        for (const assignment of assignments) {
            const activeStages = assignment.stageProgresses;
            if (activeStages.length > 0 &&
                activeStages.every((stage) => {
                    const status = normalizeUpper(stage.status);
                    return status === "PASSED" || status === "COMPLETED";
                })) {
                continue;
            }
            const currentStage = activeStages.find((stage) => stage.stageOrder === Number(assignment.currentStageOrder ?? 0)) ??
                activeStages.find((stage) => {
                    const status = normalizeUpper(stage.status);
                    return status !== "PASSED" && status !== "COMPLETED";
                }) ??
                activeStages.at(-1) ??
                null;
            const currentStageOrder = currentStage?.stageOrder ?? assignment.currentStageOrder;
            const failureNote = `Masa tenggat onboarding berakhir pada ${formatIndonesianDate(assignment.dueAt)}. Status otomatis menjadi gagal dan menunggu keputusan HRD.`;
            await prismaFlowly.$transaction(async (tx) => {
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: "FAILED",
                        failedAt: now,
                        failedBy: "SYSTEM",
                        completedAt: null,
                        completedBy: null,
                        currentStageOrder,
                        note: failureNote,
                        updatedAt: now,
                        updatedBy: "SYSTEM",
                    },
                });
                await tx.onboardingStageProgress.updateMany({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                        isDeleted: false,
                        isActive: true,
                        status: {
                            notIn: ["PASSED", "COMPLETED"],
                        },
                    },
                    data: {
                        status: "FAILED",
                        failedAt: now,
                        note: failureNote,
                        updatedAt: now,
                        updatedBy: "SYSTEM",
                    },
                });
                await tx.onboardingDecision.create({
                    data: {
                        onboardingDecisionId: createDecisionId(),
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                        decisionType: AUTO_FAILED_DECISION_TYPE,
                        nextDurationDay: null,
                        note: failureNote,
                        decidedAt: now,
                        decidedBy: "SYSTEM",
                        isActive: true,
                        isDeleted: false,
                        createdAt: now,
                        createdBy: "SYSTEM",
                        updatedAt: now,
                        updatedBy: "SYSTEM",
                        deletedAt: null,
                        deletedBy: null,
                    },
                });
            });
            invalidateProfileCache(assignment.participantReferenceId);
            const participantId = Number(assignment.participantReferenceId);
            await enqueueOnboardingOverdueNotification({
                assignment,
                employee: Number.isInteger(participantId)
                    ? employeeMap.get(participantId) ?? null
                    : null,
                failedAt: now,
            });
            expired += 1;
        }
        return { expired };
    }
    static async decideOnboarding(requesterUserId, request) {
        const validated = Validation.validate(OnboardingValidation.DECIDE_ONBOARDING, request);
        const decisionType = normalizeUpper(validated.decisionType);
        const note = normalizeNote(validated.note);
        const actorId = trimAuditActor(requesterUserId);
        const now = new Date();
        const createDecisionId = await generateOnboardingDecisionId();
        const onboardingDecisionId = createDecisionId();
        const assignment = await prismaFlowly.onboardingAssignment.findFirst({
            where: {
                onboardingAssignmentId: validated.onboardingAssignmentId,
                isDeleted: false,
            },
            include: {
                portalTemplate: {
                    select: {
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
                        examAttempts: {
                            where: {
                                isDeleted: false,
                                isActive: true,
                            },
                            orderBy: [{ attemptNo: "desc" }, { createdAt: "desc" }],
                            select: {
                                status: true,
                            },
                            take: 1,
                        },
                    },
                },
            },
        });
        if (!assignment) {
            throw new ResponseError(404, "Assignment onboarding tidak ditemukan");
        }
        const canDecideAsHrd = await hasHrdCrudAccess(requesterUserId);
        const canDecideAsPic = canDecideAsHrd
            ? true
            : await ensurePicCanAccessParticipant(requesterUserId, assignment.participantReferenceType, assignment.participantReferenceId);
        if (!canDecideAsPic) {
            throw new ResponseError(403, "Keputusan onboarding hanya bisa dibuat oleh HRD atau PIC terkait");
        }
        const decisionActorLabel = canDecideAsHrd ? "HRD" : "PIC";
        const canDirectSbuSubDecision = canDecideAsHrd ||
            (await ensureDirectSbuSubPicCanAccessParticipant(requesterUserId, assignment.participantReferenceType, assignment.participantReferenceId));
        if (decisionType === DECISION_FREEZE_TRANSFER_REVIEW &&
            !canDirectSbuSubDecision) {
            throw new ResponseError(403, "Hanya HRD atau PIC SBU Sub langsung yang bisa membekukan onboarding untuk review perpindahan departemen");
        }
        if (decisionType === DECISION_CANCEL_TRANSFER_REVIEW &&
            !canDirectSbuSubDecision) {
            throw new ResponseError(403, "Hanya HRD atau PIC SBU Sub langsung yang bisa membatalkan status beku onboarding");
        }
        const normalizedAssignmentStatus = normalizeUpper(assignment.status);
        if (decisionType === DECISION_FAIL_FINAL &&
            normalizedAssignmentStatus !== "FAILED" &&
            !canDirectSbuSubDecision) {
            throw new ResponseError(403, "Hanya HRD atau PIC SBU Sub langsung yang bisa menggagalkan onboarding yang masih berjalan");
        }
        if (decisionType === DECISION_CANCEL_TRANSFER_REVIEW &&
            normalizedAssignmentStatus !== ASSIGNMENT_STATUS_TRANSFER_REVIEW) {
            throw new ResponseError(400, "Onboarding ini tidak sedang dibekukan");
        }
        const activeStages = assignment.stageProgresses;
        const firstIncompleteStage = activeStages.find((stage) => {
            const status = normalizeUpper(stage.status);
            return status !== "PASSED" && status !== "COMPLETED";
        }) ??
            activeStages.at(-1) ??
            null;
        const currentStageOrder = firstIncompleteStage?.stageOrder ?? assignment.currentStageOrder;
        let nextStatus = assignment.status;
        let nextDueAt = assignment.dueAt;
        let nextCurrentStageOrder = assignment.currentStageOrder;
        const nextDurationDay = decisionType === DECISION_EXTEND
            ? Number(validated.nextDurationDay ?? DEFAULT_EXTENSION_DURATION_DAYS)
            : null;
        await prismaFlowly.$transaction(async (tx) => {
            if (decisionType === DECISION_PASS_OVERRIDE) {
                nextStatus = "PASSED_OVERRIDE";
                nextCurrentStageOrder =
                    activeStages.at(-1)?.stageOrder ?? assignment.currentStageOrder;
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: nextStatus,
                        currentStageOrder: nextCurrentStageOrder,
                        completedAt: now,
                        completedBy: actorId,
                        failedAt: null,
                        failedBy: null,
                        note: note ?? `${decisionActorLabel} meluluskan onboarding secara langsung.`,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                await tx.onboardingStageProgress.updateMany({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                        isDeleted: false,
                        isActive: true,
                        status: {
                            notIn: ["PASSED", "COMPLETED"],
                        },
                    },
                    data: {
                        status: "PASSED",
                        passedAt: now,
                        completedAt: now,
                        failedAt: null,
                        note: note ?? `Diluluskan langsung oleh ${decisionActorLabel}.`,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
            }
            else if (decisionType === DECISION_EXTEND) {
                const extensionDays = nextDurationDay && Number.isInteger(nextDurationDay) && nextDurationDay > 0
                    ? nextDurationDay
                    : DEFAULT_EXTENSION_DURATION_DAYS;
                nextDueAt = addDays(now, extensionDays);
                const totalDurationDay = Math.max(1, Math.ceil((nextDueAt.getTime() - assignment.startedAt.getTime()) /
                    (24 * 60 * 60 * 1000)));
                nextStatus = "IN_PROGRESS";
                nextCurrentStageOrder = currentStageOrder;
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: nextStatus,
                        durationDay: totalDurationDay,
                        dueAt: nextDueAt,
                        currentStageOrder: nextCurrentStageOrder,
                        completedAt: null,
                        completedBy: null,
                        failedAt: null,
                        failedBy: null,
                        note: note ??
                            `${decisionActorLabel} memperpanjang masa onboarding ${extensionDays} hari.`,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                for (const stage of activeStages) {
                    const stageStatus = normalizeUpper(stage.status);
                    if (stageStatus === "PASSED" || stageStatus === "COMPLETED") {
                        continue;
                    }
                    const isCurrentStage = stage.stageOrder === currentStageOrder;
                    const latestAttemptStatus = normalizeUpper(stage.examAttempts[0]?.status);
                    const restoredStatus = isCurrentStage
                        ? latestAttemptStatus === "WAITING_ADMIN"
                            ? "WAITING_ADMIN"
                            : latestAttemptStatus === "REMEDIAL" || stage.remedialCount > 0
                                ? "REMEDIAL"
                                : "READING"
                        : "LOCKED";
                    await tx.onboardingStageProgress.update({
                        where: {
                            onboardingStageProgressId: stage.onboardingStageProgressId,
                        },
                        data: {
                            status: restoredStatus,
                            failedAt: null,
                            startedAt: isCurrentStage ? stage.startedAt ?? now : stage.startedAt,
                            note: note ??
                                `Masa onboarding diperpanjang ${extensionDays} hari oleh ${decisionActorLabel}.`,
                            updatedAt: now,
                            updatedBy: actorId,
                        },
                    });
                }
            }
            else if (decisionType === DECISION_FAIL_FINAL) {
                nextStatus = "FAIL_FINAL";
                nextCurrentStageOrder = currentStageOrder;
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: nextStatus,
                        currentStageOrder: nextCurrentStageOrder,
                        completedAt: null,
                        completedBy: null,
                        failedAt: now,
                        failedBy: actorId,
                        note: note ?? `${decisionActorLabel} menetapkan gagal onboarding final.`,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                await tx.onboardingStageProgress.updateMany({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                        isDeleted: false,
                        isActive: true,
                        status: {
                            notIn: ["PASSED", "COMPLETED"],
                        },
                    },
                    data: {
                        status: "FAIL_FINAL",
                        failedAt: now,
                        note: note ?? `${decisionActorLabel} menetapkan gagal onboarding final.`,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
            }
            else if (decisionType === DECISION_FREEZE_TRANSFER_REVIEW) {
                nextStatus = ASSIGNMENT_STATUS_TRANSFER_REVIEW;
                nextCurrentStageOrder = currentStageOrder;
                const freezeNote = note ??
                    `${decisionActorLabel} membekukan onboarding karena karyawan perlu review kecocokan departemen. HRD perlu cek kebutuhan departemen lain dan interview manual sebelum onboarding dilanjutkan.`;
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: nextStatus,
                        currentStageOrder: nextCurrentStageOrder,
                        completedAt: null,
                        completedBy: null,
                        failedAt: now,
                        failedBy: actorId,
                        note: freezeNote,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                await tx.onboardingStageProgress.updateMany({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                        isDeleted: false,
                        isActive: true,
                        status: {
                            notIn: ["PASSED", "COMPLETED"],
                        },
                    },
                    data: {
                        status: ASSIGNMENT_STATUS_TRANSFER_REVIEW,
                        failedAt: now,
                        note: freezeNote,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
            }
            else if (decisionType === DECISION_CANCEL_TRANSFER_REVIEW) {
                nextStatus = "IN_PROGRESS";
                nextCurrentStageOrder = currentStageOrder;
                const cancelFreezeNote = note ??
                    `${decisionActorLabel} membatalkan status beku onboarding. Peserta kembali melanjutkan onboarding pada tahap sebelumnya.`;
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: assignment.onboardingAssignmentId,
                    },
                    data: {
                        status: nextStatus,
                        currentStageOrder: nextCurrentStageOrder,
                        completedAt: null,
                        completedBy: null,
                        failedAt: null,
                        failedBy: null,
                        note: cancelFreezeNote,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                for (const stage of activeStages) {
                    const stageStatus = normalizeUpper(stage.status);
                    if (stageStatus === "PASSED" || stageStatus === "COMPLETED") {
                        continue;
                    }
                    const isCurrentStage = stage.stageOrder === currentStageOrder;
                    const latestAttemptStatus = normalizeUpper(stage.examAttempts[0]?.status);
                    const restoredStatus = isCurrentStage
                        ? latestAttemptStatus === "WAITING_ADMIN"
                            ? "WAITING_ADMIN"
                            : latestAttemptStatus === "REMEDIAL" || stage.remedialCount > 0
                                ? "REMEDIAL"
                                : "READING"
                        : "LOCKED";
                    await tx.onboardingStageProgress.update({
                        where: {
                            onboardingStageProgressId: stage.onboardingStageProgressId,
                        },
                        data: {
                            status: restoredStatus,
                            failedAt: null,
                            startedAt: isCurrentStage ? stage.startedAt ?? now : stage.startedAt,
                            note: cancelFreezeNote,
                            updatedAt: now,
                            updatedBy: actorId,
                        },
                    });
                }
            }
            await tx.onboardingDecision.create({
                data: {
                    onboardingDecisionId,
                    onboardingAssignmentId: assignment.onboardingAssignmentId,
                    decisionType,
                    nextDurationDay,
                    note,
                    decidedAt: now,
                    decidedBy: actorId,
                    isActive: true,
                    isDeleted: false,
                    createdAt: now,
                    createdBy: actorId,
                    updatedAt: now,
                    updatedBy: actorId,
                    deletedAt: null,
                    deletedBy: null,
                },
            });
        });
        if (decisionType === DECISION_FAIL_FINAL) {
            await deactivateEmployeeAccountForFailedOnboarding({
                assignment,
                updatedAt: now,
            });
        }
        invalidateProfileCache(assignment.participantReferenceId);
        if (!canDecideAsHrd) {
            const participantId = Number(assignment.participantReferenceId);
            const employee = Number.isInteger(participantId) && participantId > 0
                ? await prismaEmployee.em_employee.findUnique({
                    where: {
                        UserId: participantId,
                    },
                    select: {
                        UserId: true,
                        CardNo: true,
                        BadgeNum: true,
                        Name: true,
                    },
                })
                : null;
            await enqueueOnboardingPicDecisionNotification({
                assignment,
                employee,
                onboardingDecisionId,
                decisionType,
                nextStatus,
                nextDueAt,
                nextDurationDay,
                note,
                decidedAt: now,
                decidedByUserId: requesterUserId,
            });
        }
        return {
            onboardingAssignmentId: assignment.onboardingAssignmentId,
            decisionType,
            status: nextStatus,
            dueAt: nextDueAt,
            currentStageOrder: nextCurrentStageOrder,
            note,
        };
    }
    static async listMyWorkspace(requesterUserId) {
        const participantReferenceId = requesterUserId.trim();
        if (!participantReferenceId) {
            return { portals: [] };
        }
        await OnboardingExamResultSyncService.syncReleasedResults({
            participantReferenceIds: [participantReferenceId],
        });
        await OnboardingService.expireOverdueAssignments({
            participantReferenceIds: [participantReferenceId],
        });
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
                            examAttempts: {
                                where: {
                                    isDeleted: false,
                                    isActive: true,
                                },
                                orderBy: [{ attemptNo: "desc" }, { createdAt: "desc" }],
                                select: {
                                    score: true,
                                    status: true,
                                    employeeExamSessionId: true,
                                    submittedAt: true,
                                    endedAt: true,
                                    note: true,
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
                                    stageExams: {
                                        where: {
                                            isDeleted: false,
                                            isActive: true,
                                        },
                                        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                                        select: {
                                            onboardingStageExamId: true,
                                            examId: true,
                                            passScore: true,
                                            orderIndex: true,
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
        const employeeId = Number(participantReferenceId);
        const scheduleNameToPortalKey = new Map();
        for (const assignment of assignments) {
            const portalKey = normalizePortalKey(assignment.portalTemplate?.portalKey ?? assignment.portalKey);
            for (const stageProgress of assignment.stageProgresses) {
                scheduleNameToPortalKey.set(getOnboardingScheduleName(portalKey, stageProgress.stageCode), portalKey);
            }
        }
        const onboardingSchedules = scheduleNameToPortalKey.size > 0
            ? await prismaEmployee.em_schedule1.findMany({
                where: {
                    scheName: {
                        in: Array.from(scheduleNameToPortalKey.keys()),
                    },
                    is_batch: ONBOARDING_EMPLOYEE_BATCH_CODE,
                },
                select: {
                    Id: true,
                    scheName: true,
                },
            })
            : [];
        const scheduleIdToPortalKey = new Map();
        for (const schedule of onboardingSchedules) {
            const portalKey = schedule.scheName
                ? scheduleNameToPortalKey.get(schedule.scheName)
                : null;
            if (portalKey) {
                scheduleIdToPortalKey.set(schedule.Id, portalKey);
            }
        }
        const onboardingScheduleIds = Array.from(scheduleIdToPortalKey.keys());
        const certificateRows = Number.isInteger(employeeId) && employeeId > 0
            ? await prismaEmployee.em_certificates_result.findMany({
                where: {
                    empl_id: employeeId,
                    status: "A",
                    ...(onboardingScheduleIds.length > 0
                        ? {
                            OR: [
                                {
                                    cert_number: {
                                        startsWith: "DOMAS/ONB/",
                                    },
                                },
                                {
                                    schedule_id: {
                                        in: onboardingScheduleIds,
                                    },
                                },
                            ],
                        }
                        : {
                            cert_number: {
                                startsWith: "DOMAS/ONB/",
                            },
                        }),
                },
                orderBy: [{ created_date: "desc" }, { cert_number: "desc" }],
                select: {
                    cert_number: true,
                    cert_templ_id: true,
                    cert_name: true,
                    created_date: true,
                    status: true,
                    generated_by: true,
                    schedule_id: true,
                },
            })
            : [];
        const certificateTemplateIds = Array.from(new Set(certificateRows.map((certificate) => certificate.cert_templ_id)));
        const certificateTemplates = certificateTemplateIds.length > 0
            ? await prismaEmployee.em_certificate_templates.findMany({
                where: {
                    certificate_id: {
                        in: certificateTemplateIds,
                    },
                },
                select: {
                    certificate_id: true,
                    certificate_name: true,
                    name: true,
                },
            })
            : [];
        const certificateTemplateMap = new Map(certificateTemplates.map((template) => [template.certificate_id, template]));
        const fallbackCertificatePortalKey = Array.from(latestByPortal.keys())[0] ?? DEFAULT_PORTAL_KEY;
        const certificatesByPortal = new Map();
        for (const certificate of certificateRows) {
            const fileName = normalizeNote(certificate.cert_name);
            if (!fileName) {
                continue;
            }
            const template = certificateTemplateMap.get(certificate.cert_templ_id);
            const portalKey = certificate.schedule_id != null
                ? scheduleIdToPortalKey.get(certificate.schedule_id) ??
                    fallbackCertificatePortalKey
                : fallbackCertificatePortalKey;
            const certificateName = normalizeNote(template?.certificate_name) ??
                normalizeNote(template?.name) ??
                "Sertifikat Onboarding";
            const urls = buildCertificateAssetUrls(fileName);
            const existing = certificatesByPortal.get(portalKey) ?? [];
            existing.push({
                certNumber: certificate.cert_number,
                certificateTemplateId: certificate.cert_templ_id,
                certificateName,
                fileName,
                imageUrl: urls.imageUrl,
                pdfUrl: urls.pdfUrl,
                status: certificate.status,
                issuedAt: certificate.created_date,
                generatedBy: normalizeNote(certificate.generated_by),
                scheduleId: certificate.schedule_id,
            });
            certificatesByPortal.set(portalKey, existing);
        }
        const sourceMaterialMap = new Map(sourceMaterials.map((material) => [material.materialId, material]));
        const workspaceExamIds = Array.from(new Set(assignments.flatMap((assignment) => assignment.stageProgresses.flatMap((stageProgress) => stageProgress.stageTemplate.stageExams.map((stageExam) => stageExam.examId)))));
        const [sourceExams, sourceExamQuestions, sourceQuestionTypes] = workspaceExamIds.length > 0
            ? await Promise.all([
                prismaEmployee.em_exams.findMany({
                    where: {
                        id: {
                            in: workspaceExamIds,
                        },
                    },
                    select: {
                        id: true,
                        exam_name: true,
                    },
                }),
                prismaEmployee.em_questions1.findMany({
                    where: {
                        exam_id: {
                            in: workspaceExamIds,
                        },
                        OR: [{ status: "A" }, { status: null }],
                    },
                    select: {
                        id: true,
                        exam_id: true,
                        question_type: true,
                        time_limit: true,
                    },
                    orderBy: [{ exam_id: "asc" }, { id: "asc" }],
                }),
                prismaEmployee.em_questtype.findMany({
                    select: {
                        Id: true,
                        TypeName: true,
                    },
                }),
            ])
            : [[], [], []];
        const sourceExamNameMap = new Map(sourceExams.map((exam) => [
            exam.id,
            normalizeNote(exam.exam_name) ?? `Ujian ${exam.id}`,
        ]));
        const sourceQuestionTypeMap = new Map(sourceQuestionTypes.map((type) => [
            type.Id,
            normalizeNote(type.TypeName) ?? `Tipe ${type.Id}`,
        ]));
        const sourceQuestionsByExam = new Map();
        for (const question of sourceExamQuestions) {
            if (!question.exam_id) {
                continue;
            }
            const existing = sourceQuestionsByExam.get(question.exam_id) ?? [];
            existing.push(question);
            sourceQuestionsByExam.set(question.exam_id, existing);
        }
        const attemptSessionIds = Array.from(new Set(assignments.flatMap((assignment) => assignment.stageProgresses.flatMap((stageProgress) => stageProgress.examAttempts
            .map((attempt) => attempt.employeeExamSessionId)
            .filter((examsId) => Boolean(examsId))))));
        const sessionScoreRows = attemptSessionIds.length > 0
            ? await prismaEmployee.em_session_exams.findMany({
                where: {
                    exams_id: {
                        in: attemptSessionIds,
                    },
                    is_score_akhir: {
                        not: null,
                    },
                },
                select: {
                    exams_id: true,
                    is_score_akhir: true,
                },
            })
            : [];
        const sessionScoreByExamId = new Map(sessionScoreRows
            .map((session) => {
            const examsId = normalizeNote(session.exams_id);
            const score = normalizeExamScore(session.is_score_akhir);
            return examsId && score != null ? [examsId, score] : null;
        })
            .filter((item) => Boolean(item)));
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
            certificates: certificatesByPortal.get(normalizePortalKey(assignment.portalTemplate?.portalKey ?? assignment.portalKey)) ?? [],
            stages: assignment.stageProgresses.map((stageProgress) => {
                const stageCompletedAt = stageProgress.completedAt ?? stageProgress.passedAt;
                const latestExamAttempt = stageProgress.examAttempts[0] ?? null;
                const resolveAttemptScore = (attempt) => attempt?.score ??
                    (attempt?.employeeExamSessionId
                        ? sessionScoreByExamId.get(attempt.employeeExamSessionId) ?? null
                        : null);
                const previousScoredAttemptScore = stageProgress.remedialCount > 0
                    ? stageProgress.examAttempts
                        .slice(1)
                        .map((attempt) => resolveAttemptScore(attempt))
                        .find((score) => score != null) ?? null
                    : null;
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
                    examScore: resolveAttemptScore(latestExamAttempt),
                    examPreviousScore: previousScoredAttemptScore,
                    examAttemptStatus: latestExamAttempt?.status ?? null,
                    examSubmittedAt: latestExamAttempt?.submittedAt ?? null,
                    examReviewedAt: latestExamAttempt?.endedAt ??
                        stageProgress.passedAt ??
                        stageProgress.completedAt,
                    examNote: normalizeUpper(latestExamAttempt?.status) === "WAITING_ADMIN"
                        ? null
                        : normalizeNote(latestExamAttempt?.note) ?? null,
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
                    exams: buildWorkspaceExamSummaries(stageProgress.stageTemplate.stageExams, sourceExamNameMap, sourceQuestionsByExam, sourceQuestionTypeMap),
                };
            }),
        }));
        return { portals };
    }
    static async listAdminMonitoring(requesterUserId, options = {}) {
        if (!options.skipAdminAccess) {
            await ensureAdminMonitoringAccess(requesterUserId);
        }
        const portalKeys = options.portalKeys?.map(normalizePortalKey).filter(Boolean) ??
            Array.from(ONBOARDING_ADMIN_PORTAL_KEYS);
        const participantEmployeeIds = Array.from(new Set((options.participantEmployeeIds ?? [])
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)));
        await OnboardingExamResultSyncService.syncReleasedResults({
            portalKeys,
        });
        await OnboardingService.expireOverdueAssignments({
            portalKeys,
        });
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
                            programType: PROGRAM_TYPE_ONBOARDING,
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
                    programType: PROGRAM_TYPE_ONBOARDING,
                    ...(options.participantEmployeeIds
                        ? {
                            participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                            participantReferenceId: {
                                in: participantEmployeeIds.map(String),
                            },
                        }
                        : {}),
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
                            examAttempts: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                orderBy: [{ attemptNo: "desc" }, { createdAt: "desc" }],
                                select: {
                                    onboardingExamAttemptId: true,
                                    examId: true,
                                    attemptNo: true,
                                    score: true,
                                    status: true,
                                    employeeExamSessionId: true,
                                    submittedAt: true,
                                    endedAt: true,
                                    note: true,
                                },
                                take: 3,
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
        const attemptSessionIds = Array.from(new Set(latestAssignments.flatMap((assignment) => assignment.stageProgresses.flatMap((stageProgress) => stageProgress.examAttempts
            .map((attempt) => attempt.employeeExamSessionId)
            .filter((examsId) => Boolean(examsId))))));
        const sessionScoreRows = attemptSessionIds.length > 0
            ? await prismaEmployee.em_session_exams.findMany({
                where: {
                    exams_id: {
                        in: attemptSessionIds,
                    },
                    is_score_akhir: {
                        not: null,
                    },
                },
                select: {
                    exams_id: true,
                    is_score_akhir: true,
                },
            })
            : [];
        const sessionScoreByExamId = new Map(sessionScoreRows
            .map((session) => {
            const examsId = normalizeNote(session.exams_id);
            const score = normalizeExamScore(session.is_score_akhir);
            return examsId && score != null ? [examsId, score] : null;
        })
            .filter((item) => Boolean(item)));
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
                    const latestExamAttempt = stageProgress?.examAttempts[0] ?? null;
                    const resolveAttemptScore = (attempt) => attempt?.score ??
                        (attempt?.employeeExamSessionId
                            ? sessionScoreByExamId.get(attempt.employeeExamSessionId) ?? null
                            : null);
                    const previousScoredAttemptScore = Number(stageProgress?.remedialCount ?? 0) > 0
                        ? stageProgress?.examAttempts
                            .slice(1)
                            .map((attempt) => resolveAttemptScore(attempt))
                            .find((score) => score != null) ?? null
                        : null;
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
                                file.completedAt ||
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
                            files: selectedFiles,
                        };
                    });
                    const totalMaterialCount = materials.reduce((sum, material) => sum + Math.max(material.fileCount, 1), 0);
                    const readMaterialCount = materials.reduce((sum, material) => {
                        if (material.fileCount > 0) {
                            return sum + material.readFileCount;
                        }
                        return sum +
                            (material.readAt ||
                                material.lastReadAt ||
                                material.completedAt ||
                                material.openCount > 0
                                ? 1
                                : 0);
                    }, 0);
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
                        examScore: resolveAttemptScore(latestExamAttempt),
                        examPreviousScore: previousScoredAttemptScore,
                        examAttemptStatus: latestExamAttempt?.status ?? null,
                        examSubmittedAt: latestExamAttempt?.submittedAt ?? null,
                        examReviewedAt: latestExamAttempt?.endedAt ??
                            stageProgress?.passedAt ??
                            stageProgress?.completedAt ??
                            null,
                        examNote: normalizeUpper(latestExamAttempt?.status) === "WAITING_ADMIN"
                            ? null
                            : normalizeNote(latestExamAttempt?.note) ?? null,
                        totalMaterialCount,
                        readMaterialCount,
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
                    onboardingAssignmentId: assignment.onboardingAssignmentId,
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
    static async listPicMonitoring(requesterUserId) {
        const scope = await resolvePicOnboardingScope(requesterUserId);
        if (!scope) {
            throw new ResponseError(403, "Akses PIC pilar/SBU/SBU Sub dibutuhkan");
        }
        const participantEmployeeIds = Array.from(await buildPicParticipantEmployeeIds(scope));
        const directSbuSubParticipantIds = await buildDirectSbuSubPicParticipantEmployeeIds(requesterUserId);
        const response = await OnboardingService.listAdminMonitoring(requesterUserId, {
            skipAdminAccess: true,
            portalKeys: [DEFAULT_PORTAL_KEY],
            participantEmployeeIds,
        });
        for (const portal of response.portals) {
            for (const participant of portal.participants) {
                const participantEmployeeId = Number(participant.participantReferenceId);
                const participantStatus = normalizeUpper(participant.status);
                const canDirectSbuSubAct = participantStatus === ASSIGNMENT_STATUS_TRANSFER_REVIEW ||
                    !isFinalAssignmentStatus(participant.status);
                participant.canFreezeForTransferReview =
                    Number.isInteger(participantEmployeeId) &&
                        directSbuSubParticipantIds.has(participantEmployeeId) &&
                        canDirectSbuSubAct;
            }
        }
        return response;
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
        await OnboardingService.expireOverdueAssignments({
            participantReferenceIds: [participantReferenceId],
        });
        const sourceMaterialMap = new Map((await OnboardingMaterialService.listSourceMaterials()).map((material) => [
            material.materialId,
            material,
        ]));
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
                            status: true,
                            dueAt: true,
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
            if (isFinalAssignmentStatus(stageProgress.assignment.status) ||
                normalizeUpper(stageProgress.status) === "FAILED" ||
                normalizeUpper(stageProgress.status) === "FAIL_FINAL") {
                throw new ResponseError(403, "Onboarding sudah terkunci karena dibekukan, gagal, atau sudah selesai");
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
                    note: true,
                },
            });
            if (!stageMaterial) {
                throw new ResponseError(404, "Materi onboarding tidak ditemukan");
            }
            const sourceMaterial = sourceMaterialMap.get(stageMaterial.materiId);
            const sourceFiles = sourceMaterial?.files ?? [];
            const selectedSourceFileIds = new Set(resolveSelectedSourceFileIds(sourceFiles.map((file) => file.id), stageMaterial.note));
            const sourceFile = normalizedSourceFileId > 0
                ? sourceFiles.find((file) => file.id === normalizedSourceFileId) ?? null
                : null;
            if (normalizedSourceFileId > 0) {
                if (!sourceFile || !selectedSourceFileIds.has(sourceFile.id)) {
                    throw new ResponseError(404, "File materi onboarding tidak ditemukan");
                }
                const requestedFileName = normalizeNote(validated.fileName);
                if (requestedFileName &&
                    normalizeUpper(sourceFile.fileName) !== normalizeUpper(requestedFileName)) {
                    throw new ResponseError(403, "Anda tidak memiliki akses ke file ini");
                }
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
            const stageMaterials = await tx.onboardingStageMaterial.findMany({
                where: {
                    onboardingStageTemplateId: stageProgress.onboardingStageTemplateId,
                    isDeleted: false,
                    isActive: true,
                },
                select: {
                    onboardingStageMaterialId: true,
                    materiId: true,
                    note: true,
                },
            });
            const materialProgresses = await tx.onboardingMaterialProgress.findMany({
                where: {
                    onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                    isDeleted: false,
                    isActive: true,
                },
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
            });
            const normalizedFinalStageStatus = normalizeUpper(finalStageStatus);
            const shouldMoveToExam = areStageMaterialsReadyForExam({
                stageMaterials,
                materialProgresses,
                sourceMaterialMap,
            }) &&
                (normalizedFinalStageStatus === "PENDING" ||
                    normalizedFinalStageStatus === "NOT_STARTED" ||
                    normalizedFinalStageStatus === "READING");
            const returnedStageStatus = shouldMoveToExam
                ? "WAITING_EXAM"
                : finalStageStatus;
            if (returnedStageStatus !== finalStageStatus) {
                await tx.onboardingStageProgress.update({
                    where: {
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                    },
                    data: {
                        startedAt: stageProgress.startedAt ?? transactionTime,
                        status: returnedStageStatus,
                        updatedBy: actorId,
                    },
                });
            }
            return {
                onboardingMaterialProgressId: materialProgress.onboardingMaterialProgressId,
                onboardingAssignmentId: stageProgress.onboardingAssignmentId,
                onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                sourceFileId: normalizedSourceFileId,
                fileName: sourceFile?.fileName ?? normalizeNote(validated.fileName),
                fileType: sourceFile?.fileType ?? null,
                fileUrl: sourceFile?.url ?? null,
                status: materialProgress.status,
                stageStatus: returnedStageStatus,
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
        await OnboardingService.expireOverdueAssignments({
            portalKeys: [portalKey],
        });
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
                failedAt: true,
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
        const assignmentEmployeeIds = Array.from(latestByEmployee.keys())
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value > 0);
        const employees = await prismaEmployee.em_employee.findMany({
            select: {
                UserId: true,
                Name: true,
            },
            orderBy: [{ UserId: "asc" }],
        });
        const employeeIds = Array.from(new Set([
            ...employees.map((employee) => employee.UserId),
            ...assignmentEmployeeIds,
        ]));
        const placementMap = await buildEmployeeOnboardingPlacementMap(employeeIds);
        const employeeNameMap = new Map(employees.map((employee) => [employee.UserId, employee.Name ?? null]));
        const summariesByEmployee = new Map();
        for (const assignment of latestByEmployee.values()) {
            const summary = toSummaryResponse(employeeNameMap, placementMap, assignment);
            if (summary) {
                summariesByEmployee.set(summary.userId, summary);
            }
        }
        for (const employee of employees) {
            if (!summariesByEmployee.has(employee.UserId)) {
                summariesByEmployee.set(employee.UserId, toNotStartedEmployeeSummaryResponse(portalKey, employee, placementMap));
            }
        }
        return Array.from(summariesByEmployee.values()).sort((left, right) => left.userId - right.userId);
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
                programType: PROGRAM_TYPE_ONBOARDING,
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
                    programType: PROGRAM_TYPE_ONBOARDING,
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
        const activeFreeEmployees = eligibleEmployees.filter((employee) => {
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
        const placementMap = await buildEmployeeOnboardingPlacementMap(activeFreeEmployees.map((employee) => employee.UserId));
        const startableEmployees = activeFreeEmployees.filter((employee) => {
            if (!hasOnboardingPlacement(placementMap, employee.UserId)) {
                skipped.push({
                    userId: employee.UserId,
                    employeeName: employee.Name ?? null,
                    reason: ONBOARDING_PLACEMENT_REQUIRED_REASON,
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
        const firstLoginParticipantRuntimeTemplates = await resolveRuntimeNotificationTemplates({
            portalKey,
            eventKey: OMS_FIRST_LOGIN_EVENT_KEY,
            recipientRole: PARTICIPANT_RECIPIENT_ROLE,
        });
        const returningParticipantRuntimeTemplates = await resolveRuntimeNotificationTemplates({
            portalKey,
            eventKey: ONBOARDING_STARTED_EVENT_KEY,
            recipientRole: PARTICIPANT_RECIPIENT_ROLE,
        });
        const returningParticipantFallbackTemplate = {
            notificationTemplateId: null,
            channel: CHANNEL_WHATSAPP,
            messageTemplate: "Halo {recipientName},\n\nOnboarding Anda untuk {portalName} sudah dimulai pada {startedDate}.\nDeadline: {dueDate}\n\nSilakan login menggunakan password OMS Anda yang sudah ada melalui {loginUrl}.",
        };
        const returningParticipantNotificationTemplates = [
            ...returningParticipantRuntimeTemplates.map((template) => ({
                notificationTemplateId: template.notificationTemplateId,
                channel: template.channel,
                messageTemplate: template.messageTemplate,
            })),
            ...(returningParticipantRuntimeTemplates.some((template) => template.channel === CHANNEL_WHATSAPP)
                ? []
                : [returningParticipantFallbackTemplate]),
        ];
        const sbuSubPicRecipients = await resolveSbuSubPicOnboardingRecipients(startableEmployees.map((employee) => employee.UserId));
        const sbuSubPicRecipientsByEmployee = groupSbuSubPicRecipientsByEmployee(sbuSubPicRecipients);
        const sbuSubPicRuntimeTemplates = await resolveRuntimeNotificationTemplates({
            portalKey,
            eventKey: ONBOARDING_STARTED_EVENT_KEY,
            recipientRole: SBU_SUB_PIC_RECIPIENT_ROLE,
        });
        const sbuSubPicFallbackTemplate = {
            notificationTemplateId: null,
            channel: CHANNEL_WHATSAPP,
            messageTemplate: "Halo {recipientName},\n\n{employeeName} ({cardNumber}) mulai onboarding {portalName} pada {startedDate}.\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nDeadline: {dueDate}\n\nPantau progres onboarding melalui {hrdUrl}.",
        };
        const sbuSubPicNotificationTemplates = [
            ...sbuSubPicRuntimeTemplates.map((template) => ({
                notificationTemplateId: template.notificationTemplateId,
                channel: template.channel,
                messageTemplate: template.messageTemplate,
            })),
            ...(sbuSubPicRuntimeTemplates.some((template) => template.channel === CHANNEL_WHATSAPP)
                ? []
                : [sbuSubPicFallbackTemplate]),
        ];
        const createNotificationOutboxId = firstLoginParticipantRuntimeTemplates.length > 0 ||
            (startableEmployees.some((employee) => !isEmployeeFirstLogin(employee.isFirstLogin)) &&
                returningParticipantNotificationTemplates.length > 0) ||
            (sbuSubPicRecipients.length > 0 &&
                sbuSubPicNotificationTemplates.length > 0)
            ? await generateNotificationOutboxId()
            : null;
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
            const isFirstLoginEmployee = isEmployeeFirstLogin(employee.isFirstLogin);
            const temporaryPassword = isFirstLoginEmployee
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
                programType: PROGRAM_TYPE_ONBOARDING,
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
            const employeeForNotification = {
                UserId: employee.UserId,
                CardNo: employee.CardNo ?? null,
                Name: employee.Name ?? null,
                Phone: employee.Phone ?? null,
                email: normalizeEmail(employee.email),
                Password: employee.Password ?? null,
                ResignDate: employee.ResignDate ?? null,
                isFirstLogin: employee.isFirstLogin ?? null,
            };
            const participantNotificationTemplates = isFirstLoginEmployee
                ? firstLoginParticipantRuntimeTemplates.map((template) => ({
                    notificationTemplateId: template.notificationTemplateId,
                    channel: template.channel,
                    messageTemplate: template.messageTemplate,
                }))
                : returningParticipantNotificationTemplates;
            const participantEventKey = isFirstLoginEmployee
                ? OMS_FIRST_LOGIN_EVENT_KEY
                : ONBOARDING_STARTED_EVENT_KEY;
            if (createNotificationOutboxId &&
                participantNotificationTemplates.length > 0) {
                const context = buildOnboardingNotificationContext({
                    employee: employeeForNotification,
                    portalKey,
                    portalName: portalTemplate.portalName,
                    durationDay,
                    dueAt,
                    startedAt,
                    temporaryPassword,
                    allowStoredPasswordFallback: isFirstLoginEmployee,
                });
                const phoneNumber = normalizePhone(employee.Phone);
                const email = normalizeEmail(employee.email);
                notificationOutboxesToCreate.push(...participantNotificationTemplates.map((template) => ({
                    notificationOutboxId: createNotificationOutboxId(),
                    notificationTemplateId: template.notificationTemplateId,
                    portalKey,
                    eventKey: participantEventKey,
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
            const sbuSubPicEmployeeRecipients = sbuSubPicRecipientsByEmployee.get(employee.UserId) ?? [];
            if (createNotificationOutboxId &&
                sbuSubPicEmployeeRecipients.length > 0 &&
                sbuSubPicNotificationTemplates.length > 0) {
                for (const recipient of sbuSubPicEmployeeRecipients) {
                    const context = buildSbuSubPicOnboardingNotificationContext({
                        employee: employeeForNotification,
                        recipient,
                        portalKey,
                        portalName: portalTemplate.portalName,
                        durationDay,
                        startedAt,
                        dueAt,
                    });
                    for (const template of sbuSubPicNotificationTemplates) {
                        const channel = normalizeUpper(template.channel);
                        const phoneNumber = channel === CHANNEL_WHATSAPP ? recipient.phoneNumber ?? "" : "";
                        if (channel === CHANNEL_WHATSAPP && !phoneNumber) {
                            logger.warn("Skipping SBU Sub PIC onboarding notification without phone", {
                                onboardingAssignmentId,
                                employeeUserId: employee.UserId,
                                recipientUserId: recipient.recipientUserId,
                                sbuSubId: recipient.sbuSubId,
                            });
                            continue;
                        }
                        notificationOutboxesToCreate.push({
                            notificationOutboxId: createNotificationOutboxId(),
                            notificationTemplateId: template.notificationTemplateId,
                            portalKey,
                            eventKey: ONBOARDING_STARTED_EVENT_KEY,
                            recipientRole: SBU_SUB_PIC_RECIPIENT_ROLE,
                            recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                            recipientReferenceId: String(recipient.recipientUserId),
                            contextReferenceType: ONBOARDING_ASSIGNMENT_CONTEXT_TYPE,
                            contextReferenceId: onboardingAssignmentId,
                            phoneNumber,
                            message: trimMessage(renderTemplate(template.messageTemplate, context)),
                            status: "PENDING",
                            attempts: 0,
                            lastError: null,
                            provider: null,
                            sentAt: null,
                            meta: JSON.stringify({
                                channel,
                                email: recipient.email,
                                phoneNumber: recipient.phoneNumber,
                                employeeUserId: employee.UserId,
                                employeeName: context.employeeName,
                                cardNumber: context.cardNumber,
                                portalName: portalTemplate.portalName,
                                sbuSubId: recipient.sbuSubId,
                                sbuSubName: context.sbuSubName,
                                sbuName: context.sbuName,
                                pilarName: context.pilarName,
                                positionName: context.positionName,
                                startedDate: context.startedDate,
                                dueDate: context.dueDate,
                                hrdUrl: context.hrdUrl,
                            }),
                            isActive: true,
                            isDeleted: false,
                            createdAt: transactionTime,
                            createdBy: actorId,
                            updatedAt: transactionTime,
                            updatedBy: actorId,
                            deletedAt: null,
                            deletedBy: null,
                        });
                    }
                }
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
                    eventKeys: [OMS_FIRST_LOGIN_EVENT_KEY, ONBOARDING_STARTED_EVENT_KEY],
                    outboxCount: notificationOutboxesToCreate.length,
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