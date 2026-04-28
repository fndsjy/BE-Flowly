import bcrypt from "bcrypt";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import {} from "../model/onboarding-model.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialService } from "./onboarding-material-service.js";
import { OnboardingExamResultSyncService } from "./onboarding-exam-result-sync-service.js";
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
const ONBOARDING_EMPLOYEE_BATCH_CODE = "ONB";
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
        await OnboardingExamResultSyncService.syncReleasedResults({
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
                    examScore: latestExamAttempt?.score ?? null,
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
    static async listAdminMonitoring(requesterUserId) {
        await ensureAdminMonitoringAccess(requesterUserId);
        const portalKeys = Array.from(ONBOARDING_ADMIN_PORTAL_KEYS);
        await OnboardingExamResultSyncService.syncReleasedResults({
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
                    note: true,
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