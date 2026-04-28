import crypto from "node:crypto";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { ResponseError } from "../error/response-error.js";
import { generateNotificationOutboxId, generateOnboardingExamAttemptId, } from "../utils/id-generator.js";
import { OnboardingEmployeeScheduleSyncService } from "./onboarding-employee-schedule-sync-service.js";
import { OnboardingMaterialService } from "./onboarding-material-service.js";
const EMPLOYEE_PARTICIPANT_REFERENCE_TYPE = "EMPLOYEE";
const STARTABLE_STAGE_STATUSES = new Set(["WAITING_EXAM", "REMEDIAL"]);
const FINISHED_FLAG = "Y";
const DEFAULT_EXAM_DURATION_SECONDS = 30 * 60;
const parseExamMonitorEmployeeIds = () => {
    const configuredIds = process.env.ONBOARDING_EXAM_MONITOR_USER_IDS ??
        process.env.ONBOARDING_EXAM_MONITOR_USER_ID ??
        "3966";
    const ids = configuredIds
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0);
    return Array.from(new Set(ids));
};
const EXAM_MONITOR_EMPLOYEE_IDS = parseExamMonitorEmployeeIds();
const EXAM_NOTIFICATION_CONTEXT_TYPE = "ONBOARDING_EXAM_SESSION";
const EXAM_STARTED_EVENT_KEY = "ONBOARDING_EXAM_STARTED";
const EXAM_FINISHED_EVENT_KEY = "ONBOARDING_EXAM_FINISHED";
const EXAM_MONITOR_RECIPIENT_ROLE = "EXAM_MONITOR";
const TRUE_FALSE_OPTIONS = [
    {
        value: "True",
        label: "True",
        display: "True",
    },
    {
        value: "False",
        label: "False",
        display: "False",
    },
];
const isUniqueConstraintError = (error) => Boolean(error &&
    typeof error === "object" &&
    error.code === "P2002");
const getNextAttemptNo = async (onboardingStageProgressId) => {
    const latestAttempt = await prismaFlowly.onboardingExamAttempt.findFirst({
        where: {
            onboardingStageProgressId,
        },
        orderBy: [{ attemptNo: "desc" }],
        select: {
            attemptNo: true,
        },
    });
    return (latestAttempt?.attemptNo ?? 0) + 1;
};
const normalizeOptionalText = (value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};
const normalizePhone = (value) => {
    if (!value)
        return null;
    const digits = value.replace(/\D+/g, "");
    return digits.length > 0 ? digits : null;
};
const normalizeUpper = (value) => value?.trim().toUpperCase() ?? "";
const parseFocusWarningCount = (note) => {
    const match = note?.match(/Exam focus warnings:\s*(\d+)/i);
    const count = Number(match?.[1] ?? 0);
    return Number.isInteger(count) && count > 0 ? count : 0;
};
const buildFocusWarningNote = (params) => {
    const baseNote = params.existingNote
        ?.replace(/\s*\|\s*Exam focus warnings:.*$/i, "")
        .trim() ?? "";
    const warningNote = `Exam focus warnings: ${params.count}; lastAt: ${params.occurredAt.toISOString()}; reason: ${params.reason}`;
    return (baseNote ? `${baseNote} | ${warningNote}` : warningNote).slice(0, 1000);
};
const formatDateTimeForNotification = (value) => value.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
const buildExamMonitorMessage = (params) => {
    const actionText = params.event === "STARTED"
        ? "sedang mengikuti ujian onboarding"
        : "sudah selesai mengerjakan ujian onboarding";
    return [
        `Notifikasi Ujian Onboarding`,
        `${params.employeeName} (${params.badgeNumber}) ${actionText}.`,
        `Portal: ${params.portalName}`,
        `Tahap: ${params.stageName}`,
        `Sesi: ${params.examsId}`,
        `Waktu: ${formatDateTimeForNotification(params.occurredAt)}`,
    ].join("\n");
};
const parseSelectedFileIds = (note) => {
    const normalizedNote = normalizeOptionalText(note);
    if (!normalizedNote) {
        return null;
    }
    try {
        const parsed = JSON.parse(normalizedNote);
        if (parsed.mode !== "SELECTED" || !Array.isArray(parsed.selectedFileIds)) {
            return null;
        }
        const selectedFileIds = Array.from(new Set(parsed.selectedFileIds
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)));
        return selectedFileIds.length > 0 ? selectedFileIds : null;
    }
    catch {
        return null;
    }
};
const resolveSelectedSourceFileIds = (sourceFileIds, note) => {
    const selectedFileIds = parseSelectedFileIds(note);
    if (!selectedFileIds) {
        return sourceFileIds;
    }
    const selectedSet = new Set(selectedFileIds);
    const filtered = sourceFileIds.filter((sourceFileId) => selectedSet.has(sourceFileId));
    return filtered.length > 0 ? filtered : sourceFileIds;
};
const hasMaterialReadSignal = (progress) => Boolean(progress &&
    (normalizeUpper(progress.status) === "COMPLETED" ||
        progress.readAt ||
        progress.lastReadAt ||
        progress.completedAt ||
        Number(progress.openCount ?? 0) > 0));
const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();
const decodeHtmlEntities = (value) => value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
const stripHtml = (value) => {
    const normalized = normalizeOptionalText(value);
    if (!normalized) {
        return null;
    }
    return normalizeOptionalText(decodeHtmlEntities(normalized
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<li>/gi, "- ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]*>/g, " "))
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " "));
};
const normalizeAnswerValue = (value) => {
    const text = (stripHtml(value) ?? normalizeOptionalText(value))?.replace(/#/g, " ");
    if (!text) {
        return null;
    }
    return normalizeWhitespace(text)
        .replace(/^[A-Z]\s*[\.\)\-:]\s*/i, "")
        .toLowerCase();
};
const expandBooleanAnswerCandidates = (value) => {
    const normalized = normalizeAnswerValue(value);
    if (!normalized) {
        return [];
    }
    if (["true", "benar", "yes", "ya", "1"].includes(normalized)) {
        return ["true", "benar", "yes", "ya", "1"];
    }
    if (["false", "salah", "no", "tidak", "0"].includes(normalized)) {
        return ["false", "salah", "no", "tidak", "0"];
    }
    return [normalized];
};
const toLegacyAnswerText = (value) => {
    const text = stripHtml(value) ?? normalizeOptionalText(value);
    if (!text) {
        return null;
    }
    return normalizeWhitespace(text).replace(/\s+/g, "#");
};
const findSelectedOption = (answer, question) => {
    const normalizedAnswer = normalizeAnswerValue(answer);
    if (!normalizedAnswer) {
        return null;
    }
    return (question.em_questions2.find((item) => {
        const choice = normalizeAnswerValue(item.option_choices);
        const text = normalizeAnswerValue(item.option_text);
        return choice === normalizedAnswer || text === normalizedAnswer;
    }) ?? null);
};
const buildAnswer2Value = (params) => {
    if (!params.answer) {
        return null;
    }
    if (params.isBoolean) {
        const candidates = expandBooleanAnswerCandidates(params.answer);
        if (candidates.includes("true")) {
            return "true";
        }
        if (candidates.includes("false")) {
            return "false";
        }
        return toLegacyAnswerText(params.answer);
    }
    if (params.isEssay) {
        return toLegacyAnswerText(params.answer);
    }
    const selectedOption = findSelectedOption(params.answer, params.question);
    return toLegacyAnswerText(selectedOption?.option_text ?? params.answer);
};
const sanitizeBadgeNumber = (value, fallback) => {
    const normalized = normalizeOptionalText(value)?.replace(/-/g, "");
    return normalized && normalized.length > 0 ? normalized : String(fallback);
};
const addSeconds = (value, seconds) => new Date(value.getTime() + seconds * 1000);
const toLegacyQuestionType = (typeId, typeMap) => {
    const typeName = typeId != null ? typeMap.get(typeId)?.toLowerCase() ?? "" : "";
    if (typeName.includes("essay")) {
        return "es";
    }
    if (typeName.includes("true") || typeName.includes("false")) {
        return "tf";
    }
    return "pg";
};
const toRuntimeQuestionType = (type) => {
    if (type === "es")
        return "essay";
    if (type === "tf")
        return "boolean";
    return "mcq";
};
const parseSoalUrut = (value) => {
    const normalized = normalizeOptionalText(value);
    if (!normalized) {
        return [];
    }
    try {
        const parsed = JSON.parse(normalized);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }
            const questionId = Number(item.id);
            const tipe = item.tipe;
            if (!Number.isInteger(questionId) || questionId <= 0) {
                return null;
            }
            const parsedOptions = Array.isArray(item.options)
                ? Array.from(new Set(item.options
                    .map((option) => typeof option === "string" ? option.trim() : null)
                    .filter((option) => Boolean(option))))
                : [];
            const parsedItem = {
                id: questionId,
                tipe: tipe === "tf" || tipe === "es" ? tipe : "pg",
            };
            if (parsedOptions.length > 0) {
                parsedItem.options = parsedOptions;
            }
            return parsedItem;
        })
            .filter((item) => Boolean(item));
    }
    catch {
        return [];
    }
};
const shuffle = (items) => {
    const output = [...items];
    for (let index = output.length - 1; index > 0; index -= 1) {
        const randomIndex = crypto.randomInt(index + 1);
        const current = output[index];
        output[index] = output[randomIndex];
        output[randomIndex] = current;
    }
    return output;
};
const hasSameOrder = (items, previousIds, getId) => items.length === previousIds.length &&
    items.every((item, index) => getId(item) === previousIds[index]);
const hasSameQuestionSet = (items, previousIds, getId) => {
    if (items.length !== previousIds.length) {
        return false;
    }
    const currentIds = new Set(items.map(getId));
    return previousIds.every((id) => currentIds.has(id));
};
const rotateOnce = (items) => items.length > 1 ? [...items.slice(1), items[0]] : items;
const shuffleDifferentFromPrevious = (items, previousIds, getId) => {
    if (items.length <= 1 || !hasSameQuestionSet(items, previousIds, getId)) {
        return shuffle(items);
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const shuffled = shuffle(items);
        if (!hasSameOrder(shuffled, previousIds, getId)) {
            return shuffled;
        }
    }
    return rotateOnce(items);
};
const encryptTokenPayload = (payload) => {
    const secret = process.env.EXAM_TOKEN_SECRET || process.env.JWT_SECRET || "supersecret";
    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(payload, "utf8"),
        cipher.final(),
    ]);
    const hmac = crypto.createHmac("sha256", key).update(Buffer.concat([iv, encrypted])).digest();
    return Buffer.concat([iv, hmac, encrypted]).toString("base64");
};
const getQuestionTypeMap = async () => {
    const rows = await prismaEmployee.em_questtype.findMany({
        select: {
            Id: true,
            TypeName: true,
        },
    });
    return new Map(rows.map((row) => [row.Id, row.TypeName]));
};
const buildQuestionsResponse = async (soalUrut) => {
    if (soalUrut.length === 0) {
        return [];
    }
    const questions = await prismaEmployee.em_questions1.findMany({
        where: {
            id: {
                in: soalUrut.map((item) => item.id),
            },
        },
        select: {
            id: true,
            question_text: true,
            time_limit: true,
            em_questions2: {
                select: {
                    option_choices: true,
                    option_text: true,
                },
                orderBy: [{ option_choices: "asc" }],
            },
        },
    });
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    return soalUrut
        .map((item, index) => {
        const question = questionMap.get(item.id);
        if (!question) {
            return null;
        }
        const optionMap = new Map(question.em_questions2.map((option) => [option.option_choices, option]));
        const orderedOptionRows = item.options && item.options.length > 0
            ? [
                ...item.options
                    .map((optionChoice) => optionMap.get(optionChoice))
                    .filter((option) => Boolean(option)),
                ...question.em_questions2.filter((option) => !item.options?.includes(option.option_choices)),
            ]
            : question.em_questions2;
        const options = item.tipe === "tf" && orderedOptionRows.length === 0
            ? TRUE_FALSE_OPTIONS
            : orderedOptionRows.map((option) => {
                const label = stripHtml(option.option_text) ?? option.option_choices;
                return {
                    value: option.option_choices,
                    label,
                    display: label,
                };
            });
        return {
            questionId: question.id,
            orderIndex: index + 1,
            type: toRuntimeQuestionType(item.tipe),
            legacyType: item.tipe,
            prompt: stripHtml(question.question_text) ?? `Soal ${question.id}`,
            options,
            helper: item.tipe === "es"
                ? "Tulis jawaban essay Anda."
                : "Pilih satu jawaban paling tepat.",
            timeLimitSeconds: Number.isFinite(question.time_limit) ? question.time_limit : 0,
        };
    })
        .filter((item) => Boolean(item));
};
const getSessionDurationSeconds = (session) => {
    if (session.start_time && session.is_token_expr) {
        const diff = Math.ceil((session.is_token_expr.getTime() - session.start_time.getTime()) / 1000);
        if (diff > 0) {
            return diff;
        }
    }
    return Math.max(1, Number(session.durasi ?? 0)) * 60;
};
const buildStartResponse = async (params) => {
    const soalUrut = parseSoalUrut(params.session.soal_urut);
    const durationSeconds = getSessionDurationSeconds(params.session);
    const questions = await buildQuestionsResponse(soalUrut);
    const savedAnswers = params.session.exams_id
        ? await prismaEmployee.em_jawaban_peserta.findMany({
            where: {
                session_exams_id: params.session.exams_id,
                ...(params.session.empl_id
                    ? {
                        empl_id: params.session.empl_id,
                    }
                    : {}),
            },
            select: {
                soal_id: true,
                jawaban: true,
            },
            orderBy: [{ soal_id: "asc" }, { Id: "asc" }],
        })
        : [];
    return {
        onboardingStageProgressId: params.stageProgressId,
        session: {
            id: params.session.Id,
            scheduleId: params.session.schedule_id,
            examsId: params.session.exams_id,
            startTime: params.session.start_time,
            endTime: params.session.end_time,
            tokenExpiresAt: params.session.is_token_expr,
            durationSeconds,
            durationMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
            isFinished: params.session.is_selesai === FINISHED_FLAG,
        },
        questions,
        answers: savedAnswers.map((answer) => ({
            questionId: answer.soal_id,
            answer: answer.jawaban,
        })),
    };
};
const createExamsId = async (timestamp, badgeNumber) => {
    let candidateTimestamp = timestamp;
    for (let attempt = 0; attempt < 30; attempt += 1) {
        const examsId = `${candidateTimestamp}#${badgeNumber}`;
        const existing = await prismaEmployee.em_session_exams.findUnique({
            where: {
                exams_id: examsId,
            },
            select: {
                Id: true,
            },
        });
        if (!existing) {
            return {
                examsId,
                timestamp: candidateTimestamp,
            };
        }
        candidateTimestamp += 1;
    }
    throw new ResponseError(409, "Gagal membuat nomor sesi ujian unik");
};
const ensureScheduleParticipant = async (scheduleId, employeeId) => {
    const existing = await prismaEmployee.em_schedule2.findFirst({
        where: {
            scheduleId,
            employeeId,
        },
        select: {
            Id: true,
        },
    });
    if (existing) {
        return existing.Id;
    }
    const created = await prismaEmployee.em_schedule2.create({
        data: {
            scheduleId,
            employeeId,
        },
        select: {
            Id: true,
        },
    });
    return created.Id;
};
const createOrUpdateAttempt = async (params) => {
    const existing = await prismaFlowly.onboardingExamAttempt.findFirst({
        where: {
            employeeExamSessionId: params.examsId,
            isDeleted: false,
        },
        select: {
            onboardingExamAttemptId: true,
        },
    });
    if (existing) {
        return existing.onboardingExamAttemptId;
    }
    const primaryStageExam = params.stageProgress.stageTemplate.stageExams[0];
    if (!primaryStageExam) {
        return null;
    }
    for (let retry = 0; retry < 3; retry += 1) {
        const makeAttemptId = await generateOnboardingExamAttemptId();
        const attemptNo = await getNextAttemptNo(params.stageProgress.onboardingStageProgressId);
        try {
            const created = await prismaFlowly.onboardingExamAttempt.create({
                data: {
                    onboardingExamAttemptId: makeAttemptId(),
                    onboardingAssignmentId: params.stageProgress.onboardingAssignmentId,
                    onboardingStageProgressId: params.stageProgress.onboardingStageProgressId,
                    onboardingStageExamId: primaryStageExam.onboardingStageExamId,
                    examId: null,
                    attemptNo,
                    startedAt: params.startedAt,
                    totalQuestionCount: params.totalQuestionCount,
                    employeeExamSessionId: params.examsId,
                    status: "IN_PROGRESS",
                    isActive: true,
                    isDeleted: false,
                    createdAt: params.startedAt,
                    createdBy: params.requesterUserId,
                    updatedAt: params.startedAt,
                    updatedBy: params.requesterUserId,
                },
                select: {
                    onboardingExamAttemptId: true,
                },
            });
            return created.onboardingExamAttemptId;
        }
        catch (error) {
            if (!isUniqueConstraintError(error)) {
                throw error;
            }
            const concurrent = await prismaFlowly.onboardingExamAttempt.findFirst({
                where: {
                    employeeExamSessionId: params.examsId,
                    isDeleted: false,
                },
                select: {
                    onboardingExamAttemptId: true,
                },
            });
            if (concurrent) {
                return concurrent.onboardingExamAttemptId;
            }
        }
    }
    throw new ResponseError(409, "Gagal membuat attempt ujian unik");
};
const getAuthorizedStageProgress = async (requesterUserId, onboardingStageProgressId) => {
    const stageProgress = await prismaFlowly.onboardingStageProgress.findFirst({
        where: {
            onboardingStageProgressId,
            isActive: true,
            isDeleted: false,
            assignment: {
                participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                participantReferenceId: requesterUserId,
                isActive: true,
                isDeleted: false,
            },
        },
        include: {
            assignment: {
                select: {
                    onboardingAssignmentId: true,
                    portalKey: true,
                    status: true,
                    participantReferenceId: true,
                },
            },
            materialProgresses: {
                where: {
                    isActive: true,
                    isDeleted: false,
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
            },
            stageTemplate: {
                include: {
                    portalTemplate: {
                        select: {
                            portalKey: true,
                            portalName: true,
                        },
                    },
                    stageMaterials: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                        select: {
                            onboardingStageMaterialId: true,
                            materiId: true,
                            note: true,
                        },
                    },
                    stageExams: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                        select: {
                            onboardingStageExamId: true,
                            examId: true,
                        },
                    },
                },
            },
        },
    });
    if (!stageProgress) {
        throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
    }
    return stageProgress;
};
const enqueueExamMonitorNotification = async (params) => {
    if (!params.examsId || EXAM_MONITOR_EMPLOYEE_IDS.length === 0) {
        return;
    }
    const eventKey = params.event === "STARTED" ? EXAM_STARTED_EVENT_KEY : EXAM_FINISHED_EVENT_KEY;
    try {
        const existing = await prismaFlowly.notificationOutbox.findMany({
            where: {
                eventKey,
                recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                recipientReferenceId: {
                    in: EXAM_MONITOR_EMPLOYEE_IDS.map(String),
                },
                contextReferenceType: EXAM_NOTIFICATION_CONTEXT_TYPE,
                contextReferenceId: params.examsId,
                isDeleted: false,
            },
            select: {
                recipientReferenceId: true,
            },
        });
        const existingRecipientIds = new Set(existing.map((item) => Number(item.recipientReferenceId)));
        const recipientIds = EXAM_MONITOR_EMPLOYEE_IDS.filter((recipientId) => !existingRecipientIds.has(recipientId));
        if (recipientIds.length === 0) {
            return;
        }
        const recipients = await prismaEmployee.em_employee.findMany({
            where: {
                UserId: {
                    in: recipientIds,
                },
            },
            select: {
                UserId: true,
                Phone: true,
            },
        });
        const recipientMap = new Map(recipients.map((recipient) => [recipient.UserId, recipient]));
        const availableRecipients = recipientIds
            .map((recipientId) => recipientMap.get(recipientId) ?? null)
            .filter((recipient) => Boolean(recipient))
            .map((recipient) => ({
            ...recipient,
            phoneNumber: normalizePhone(recipient.Phone),
        }));
        const notifiableRecipients = availableRecipients.filter((recipient) => Boolean(recipient.phoneNumber));
        for (const recipientId of recipientIds) {
            const recipient = recipientMap.get(recipientId);
            const phoneNumber = normalizePhone(recipient?.Phone);
            if (!recipient || !phoneNumber) {
                logger.warn("Failed to enqueue onboarding exam monitor notification", {
                    eventKey,
                    examsId: params.examsId,
                    recipientUserId: recipientId,
                    reason: recipient ? "Missing phone number" : "Recipient employee not found",
                });
            }
        }
        if (notifiableRecipients.length === 0) {
            logger.warn("Failed to enqueue onboarding exam monitor notification", {
                eventKey,
                examsId: params.examsId,
                recipientUserIds: recipientIds,
                reason: "No recipient has a valid phone number",
            });
            return;
        }
        const createNotificationOutboxId = await generateNotificationOutboxId();
        const portalName = params.stageProgress.stageTemplate.portalTemplate.portalName ||
            params.stageProgress.assignment.portalKey;
        const badgeNumber = params.employee.BadgeNum?.trim() ||
            params.employee.CardNo?.trim() ||
            String(params.employee.UserId);
        const employeeName = params.employee.Name?.trim() || `Employee ${params.employee.UserId}`;
        const message = buildExamMonitorMessage({
            event: params.event,
            employeeName,
            badgeNumber,
            stageName: params.stageProgress.stageName,
            portalName,
            examsId: params.examsId,
            occurredAt: params.occurredAt,
        });
        await prismaFlowly.notificationOutbox.createMany({
            data: notifiableRecipients.map((recipient) => ({
                notificationOutboxId: createNotificationOutboxId(),
                notificationTemplateId: null,
                portalKey: params.stageProgress.assignment.portalKey,
                eventKey,
                recipientRole: EXAM_MONITOR_RECIPIENT_ROLE,
                recipientReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
                recipientReferenceId: String(recipient.UserId),
                contextReferenceType: EXAM_NOTIFICATION_CONTEXT_TYPE,
                contextReferenceId: params.examsId,
                phoneNumber: recipient.phoneNumber ?? "",
                message,
                status: "PENDING",
                attempts: 0,
                lastError: null,
                provider: null,
                sentAt: null,
                meta: JSON.stringify({
                    channel: "WHATSAPP",
                    event: params.event,
                    examsId: params.examsId,
                    participantUserId: params.employee.UserId,
                    participantName: employeeName,
                    participantBadge: badgeNumber,
                    stageProgressId: params.stageProgress.onboardingStageProgressId,
                    stageName: params.stageProgress.stageName,
                    portalKey: params.stageProgress.assignment.portalKey,
                    portalName,
                }),
                isActive: true,
                isDeleted: false,
                createdAt: params.occurredAt,
                createdBy: "SYSTEM",
                updatedAt: params.occurredAt,
                updatedBy: "SYSTEM",
                deletedAt: null,
                deletedBy: null,
            })),
        });
    }
    catch (error) {
        logger.warn("Failed to enqueue onboarding exam monitor notification", {
            eventKey,
            examsId: params.examsId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
const buildMaterialProgressKey = (onboardingStageMaterialId, sourceFileId) => `${onboardingStageMaterialId}:${sourceFileId}`;
const areAllStageMaterialsOpened = async (stageProgress) => {
    const sourceMaterialMap = new Map((await OnboardingMaterialService.listSourceMaterials()).map((material) => [
        material.materialId,
        material,
    ]));
    const progressMap = new Map(stageProgress.materialProgresses.map((progress) => [
        buildMaterialProgressKey(progress.onboardingStageMaterialId, progress.sourceFileId),
        progress,
    ]));
    return stageProgress.stageTemplate.stageMaterials.every((stageMaterial) => {
        const sourceFileIds = sourceMaterialMap
            .get(stageMaterial.materiId)
            ?.files.map((file) => file.id) ?? [];
        const selectedFileIds = resolveSelectedSourceFileIds(sourceFileIds, stageMaterial.note);
        if (selectedFileIds.length === 0) {
            return true;
        }
        return selectedFileIds.every((sourceFileId) => hasMaterialReadSignal(progressMap.get(buildMaterialProgressKey(stageMaterial.onboardingStageMaterialId, sourceFileId))));
    });
};
const getExistingActiveSession = async (scheduleId, employeeId) => {
    const existing = await prismaEmployee.em_session_exams.findFirst({
        where: {
            schedule_id: scheduleId,
            empl_id: employeeId,
            OR: [{ is_selesai: null }, { is_selesai: { not: FINISHED_FLAG } }],
        },
        orderBy: [{ start_time: "desc" }, { Id: "desc" }],
    });
    if (!existing) {
        return null;
    }
    const now = new Date();
    if (existing.is_token_expr && existing.is_token_expr.getTime() <= now.getTime()) {
        await prismaEmployee.em_session_exams.update({
            where: {
                Id: existing.Id,
            },
            data: {
                end_time: existing.is_token_expr,
                is_selesai: FINISHED_FLAG,
                is_correct: 0,
                is_notes: "Waktu ujian habis sebelum submit.",
            },
        });
        return null;
    }
    return existing;
};
const buildObjectiveScore = (params) => {
    const answer = normalizeAnswerValue(params.answer);
    if (!answer) {
        return 0;
    }
    const option = findSelectedOption(params.answer, params.question);
    const normalizeCandidates = params.isBoolean
        ? expandBooleanAnswerCandidates
        : (value) => {
            const normalized = normalizeAnswerValue(value);
            return normalized ? [normalized] : [];
        };
    const answerCandidates = (params.answer2
        ? [params.answer2]
        : [option?.option_text, answer])
        .flatMap(normalizeCandidates)
        .filter((value, index, values) => values.indexOf(value) === index);
    const correctCandidates = [
        params.question.correct_answer2,
        params.question.correct_answer,
    ]
        .flatMap(normalizeCandidates)
        .filter((value, index, values) => values.indexOf(value) === index);
    const isCorrect = answerCandidates.some((candidate) => correctCandidates.includes(candidate));
    return isCorrect ? Number(params.question.score ?? 0) : 0;
};
export class OnboardingExamRuntimeService {
    static async start(requesterUserId, request) {
        const onboardingStageProgressId = normalizeOptionalText(request.onboardingStageProgressId);
        if (!onboardingStageProgressId) {
            throw new ResponseError(400, "Tahap onboarding wajib diisi");
        }
        const employeeId = Number(requesterUserId);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            throw new ResponseError(403, "Akun ini tidak terhubung ke employee");
        }
        const [stageProgress, employee] = await Promise.all([
            getAuthorizedStageProgress(requesterUserId, onboardingStageProgressId),
            prismaEmployee.em_employee.findUnique({
                where: {
                    UserId: employeeId,
                },
                select: {
                    UserId: true,
                    BadgeNum: true,
                    CardNo: true,
                    Name: true,
                },
            }),
        ]);
        if (!employee) {
            throw new ResponseError(404, "Data employee tidak ditemukan");
        }
        const normalizedStageStatus = normalizeUpper(stageProgress.status);
        const canPromoteReadingStage = normalizedStageStatus === "READING" ||
            normalizedStageStatus === "PENDING" ||
            normalizedStageStatus === "NOT_STARTED";
        const materialsReadyForExam = STARTABLE_STAGE_STATUSES.has(normalizedStageStatus) ||
            (canPromoteReadingStage
                ? await areAllStageMaterialsOpened(stageProgress)
                : false);
        if (!STARTABLE_STAGE_STATUSES.has(normalizedStageStatus) && !materialsReadyForExam) {
            throw new ResponseError(400, "Tahap ini belum siap untuk ujian");
        }
        if (!STARTABLE_STAGE_STATUSES.has(normalizedStageStatus) && materialsReadyForExam) {
            await prismaFlowly.onboardingStageProgress.update({
                where: {
                    onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                },
                data: {
                    status: "WAITING_EXAM",
                    startedAt: stageProgress.startedAt ?? new Date(),
                    updatedBy: requesterUserId,
                },
            });
            stageProgress.status = "WAITING_EXAM";
        }
        if (stageProgress.stageTemplate.stageExams.length === 0) {
            throw new ResponseError(400, "Tahap ini belum memiliki ujian");
        }
        const syncResult = await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(stageProgress.onboardingStageTemplateId);
        if (!syncResult) {
            throw new ResponseError(404, "Schedule ujian onboarding tidak ditemukan");
        }
        await ensureScheduleParticipant(syncResult.scheduleId, employeeId);
        const existingSession = await getExistingActiveSession(syncResult.scheduleId, employeeId);
        if (existingSession) {
            await createOrUpdateAttempt({
                requesterUserId,
                stageProgress,
                examsId: existingSession.exams_id ?? "",
                startedAt: existingSession.start_time ?? new Date(),
                totalQuestionCount: parseSoalUrut(existingSession.soal_urut).length,
            });
            await enqueueExamMonitorNotification({
                event: "STARTED",
                examsId: existingSession.exams_id ?? "",
                employee,
                stageProgress,
                occurredAt: existingSession.start_time ?? new Date(),
            });
            return buildStartResponse({
                stageProgressId: onboardingStageProgressId,
                session: existingSession,
            });
        }
        const scheduleQuestions = await prismaEmployee.em_schedule3.findMany({
            where: {
                scheduleId: syncResult.scheduleId,
            },
            orderBy: [{ urutanSoal: "asc" }, { Id: "asc" }],
        });
        if (scheduleQuestions.length === 0) {
            throw new ResponseError(400, "Schedule ujian belum memiliki soal");
        }
        const typeMap = await getQuestionTypeMap();
        const previousSession = await prismaEmployee.em_session_exams.findFirst({
            where: {
                schedule_id: syncResult.scheduleId,
                empl_id: employeeId,
                is_selesai: FINISHED_FLAG,
            },
            orderBy: [{ start_time: "desc" }, { Id: "desc" }],
            select: {
                soal_urut: true,
            },
        });
        const previousQuestionIdsByType = new Map();
        for (const item of parseSoalUrut(previousSession?.soal_urut)) {
            const existing = previousQuestionIdsByType.get(item.tipe) ?? [];
            existing.push(item.id);
            previousQuestionIdsByType.set(item.tipe, existing);
        }
        const groupedQuestions = new Map();
        for (const question of scheduleQuestions) {
            const tipeSoal = question.tipeSoal != null && Number.isInteger(question.tipeSoal)
                ? question.tipeSoal
                : 0;
            const group = groupedQuestions.get(tipeSoal) ?? [];
            group.push(question);
            groupedQuestions.set(tipeSoal, group);
        }
        const orderedShuffledQuestions = Array.from(groupedQuestions.entries())
            .sort((left, right) => {
            const leftFirstOrder = Math.min(...left[1].map((question) => Number(question.urutanSoal ?? 999999)));
            const rightFirstOrder = Math.min(...right[1].map((question) => Number(question.urutanSoal ?? 999999)));
            if (leftFirstOrder !== rightFirstOrder) {
                return leftFirstOrder - rightFirstOrder;
            }
            return left[0] - right[0];
        })
            .flatMap(([tipeSoal, questions]) => {
            const sortedQuestions = [...questions].sort((left, right) => {
                const leftOrder = Number(left.urutanTipeSoal ?? left.urutanSoal ?? 0);
                const rightOrder = Number(right.urutanTipeSoal ?? right.urutanSoal ?? 0);
                if (leftOrder !== rightOrder) {
                    return leftOrder - rightOrder;
                }
                return left.Id - right.Id;
            });
            const legacyType = toLegacyQuestionType(tipeSoal, typeMap);
            return shuffleDifferentFromPrevious(sortedQuestions, previousQuestionIdsByType.get(legacyType) ?? [], (question) => question.soalId);
        });
        const baseSoalUrut = orderedShuffledQuestions.map((question) => ({
            id: question.soalId,
            tipe: toLegacyQuestionType(question.tipeSoal, typeMap),
        }));
        const multipleChoiceQuestionIds = baseSoalUrut
            .filter((item) => item.tipe === "pg")
            .map((item) => item.id);
        const optionRows = multipleChoiceQuestionIds.length > 0
            ? await prismaEmployee.em_questions2.findMany({
                where: {
                    question_id: {
                        in: multipleChoiceQuestionIds,
                    },
                },
                select: {
                    question_id: true,
                    option_choices: true,
                },
                orderBy: [{ question_id: "asc" }, { option_choices: "asc" }],
            })
            : [];
        const optionMap = new Map();
        for (const option of optionRows) {
            const choices = optionMap.get(option.question_id) ?? [];
            choices.push(option.option_choices);
            optionMap.set(option.question_id, choices);
        }
        const soalUrut = baseSoalUrut.map((item) => ({
            ...item,
            ...(item.tipe === "pg" && (optionMap.get(item.id)?.length ?? 0) > 1
                ? {
                    options: shuffle(optionMap.get(item.id) ?? []),
                }
                : {}),
        }));
        const questionDurations = await prismaEmployee.em_questions1.findMany({
            where: {
                id: {
                    in: soalUrut.map((item) => item.id),
                },
            },
            select: {
                id: true,
                time_limit: true,
            },
        });
        const durationSeconds = questionDurations.reduce((sum, question) => sum + Math.max(0, Number.isFinite(question.time_limit) ? question.time_limit : 0), 0) || DEFAULT_EXAM_DURATION_SECONDS;
        const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
        const startTime = new Date();
        const tokenExpiresAt = addSeconds(startTime, durationSeconds);
        const badgeNumber = sanitizeBadgeNumber(employee.CardNo ?? employee.BadgeNum, employee.UserId);
        const timestamp = Math.floor(startTime.getTime() / 1000);
        let createdSession = null;
        let examsId = "";
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const { examsId: candidateExamsId, timestamp: tokenTimestamp } = await createExamsId(timestamp + attempt, badgeNumber);
            const token = encryptTokenPayload(`${candidateExamsId}${tokenTimestamp}`);
            try {
                createdSession = await prismaEmployee.em_session_exams.create({
                    data: {
                        schedule_id: syncResult.scheduleId,
                        exams_id: candidateExamsId,
                        empl_id: employeeId,
                        soal_urut: JSON.stringify(soalUrut),
                        start_time: startTime,
                        end_time: null,
                        is_selesai: "N",
                        is_token: token,
                        is_token_expr: tokenExpiresAt,
                        durasi: durationMinutes,
                        is_correct: 0,
                        is_notes: null,
                        is_score_akhir: null,
                    },
                });
                examsId = candidateExamsId;
                break;
            }
            catch (error) {
                if (!isUniqueConstraintError(error)) {
                    throw error;
                }
                const concurrentSession = await getExistingActiveSession(syncResult.scheduleId, employeeId);
                if (concurrentSession) {
                    await createOrUpdateAttempt({
                        requesterUserId,
                        stageProgress,
                        examsId: concurrentSession.exams_id ?? "",
                        startedAt: concurrentSession.start_time ?? new Date(),
                        totalQuestionCount: parseSoalUrut(concurrentSession.soal_urut).length,
                    });
                    await enqueueExamMonitorNotification({
                        event: "STARTED",
                        examsId: concurrentSession.exams_id ?? "",
                        employee,
                        stageProgress,
                        occurredAt: concurrentSession.start_time ?? new Date(),
                    });
                    return buildStartResponse({
                        stageProgressId: onboardingStageProgressId,
                        session: concurrentSession,
                    });
                }
            }
        }
        if (!createdSession || !examsId) {
            throw new ResponseError(409, "Gagal membuat sesi ujian unik");
        }
        await createOrUpdateAttempt({
            requesterUserId,
            stageProgress,
            examsId,
            startedAt: startTime,
            totalQuestionCount: soalUrut.length,
        });
        await enqueueExamMonitorNotification({
            event: "STARTED",
            examsId,
            employee,
            stageProgress,
            occurredAt: startTime,
        });
        return buildStartResponse({
            stageProgressId: onboardingStageProgressId,
            session: createdSession,
        });
    }
    static async saveAnswer(requesterUserId, request) {
        const examsId = normalizeOptionalText(request.examsId);
        if (!examsId) {
            throw new ResponseError(400, "Sesi ujian wajib diisi");
        }
        const questionId = Number(request.questionId);
        if (!Number.isInteger(questionId) || questionId <= 0) {
            throw new ResponseError(400, "Soal wajib diisi");
        }
        const employeeId = Number(requesterUserId);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            throw new ResponseError(403, "Akun ini tidak terhubung ke employee");
        }
        const session = await prismaEmployee.em_session_exams.findFirst({
            where: {
                exams_id: examsId,
                empl_id: employeeId,
            },
        });
        if (!session) {
            throw new ResponseError(404, "Sesi ujian tidak ditemukan");
        }
        if (session.is_selesai === FINISHED_FLAG) {
            throw new ResponseError(400, "Sesi ujian sudah selesai");
        }
        if (session.is_token_expr && session.is_token_expr.getTime() <= Date.now()) {
            throw new ResponseError(400, "Waktu ujian sudah habis");
        }
        const soalUrut = parseSoalUrut(session.soal_urut);
        const soalItem = soalUrut.find((item) => item.id === questionId);
        if (!soalItem) {
            throw new ResponseError(400, "Soal tidak termasuk dalam sesi ujian ini");
        }
        const answer = normalizeOptionalText(request.answer);
        const savedAt = new Date();
        if (!answer) {
            await prismaEmployee.em_jawaban_peserta.deleteMany({
                where: {
                    empl_id: employeeId,
                    session_exams_id: examsId,
                    soal_id: questionId,
                },
            });
            return {
                examsId,
                questionId,
                saved: false,
                savedAt,
            };
        }
        const question = await prismaEmployee.em_questions1.findUnique({
            where: {
                id: questionId,
            },
            select: {
                id: true,
                correct_answer: true,
                correct_answer2: true,
                score: true,
                em_questions2: {
                    select: {
                        option_choices: true,
                        option_text: true,
                    },
                },
            },
        });
        if (!question) {
            throw new ResponseError(404, "Soal tidak ditemukan");
        }
        const isEssay = soalItem.tipe === "es";
        const answer2 = buildAnswer2Value({
            answer,
            isBoolean: soalItem.tipe === "tf",
            isEssay,
            question,
        });
        const score = !isEssay
            ? buildObjectiveScore({
                answer,
                answer2,
                isBoolean: soalItem.tipe === "tf",
                question,
            })
            : null;
        await prismaEmployee.$transaction(async (tx) => {
            await tx.em_jawaban_peserta.deleteMany({
                where: {
                    empl_id: employeeId,
                    session_exams_id: examsId,
                    soal_id: questionId,
                },
            });
            await tx.em_jawaban_peserta.create({
                data: {
                    empl_id: employeeId,
                    soal_id: questionId,
                    session_exams_id: examsId,
                    jawaban: answer,
                    jawaban2: answer2,
                    waktu_jawab: savedAt,
                    Score: score,
                    is_correction: isEssay ? 0 : 1,
                    is_train_jawaban: false,
                },
            });
        });
        return {
            examsId,
            questionId,
            saved: true,
            savedAt,
        };
    }
    static async recordWarning(requesterUserId, request) {
        const examsId = normalizeOptionalText(request.examsId);
        if (!examsId) {
            throw new ResponseError(400, "Sesi ujian wajib diisi");
        }
        const employeeId = Number(requesterUserId);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            throw new ResponseError(403, "Akun ini tidak terhubung ke employee");
        }
        const session = await prismaEmployee.em_session_exams.findFirst({
            where: {
                exams_id: examsId,
                empl_id: employeeId,
            },
            select: {
                Id: true,
            },
        });
        if (!session) {
            throw new ResponseError(404, "Sesi ujian tidak ditemukan");
        }
        const attempt = await prismaFlowly.onboardingExamAttempt.findFirst({
            where: {
                employeeExamSessionId: examsId,
                isDeleted: false,
            },
            select: {
                onboardingExamAttemptId: true,
                note: true,
            },
        });
        if (!attempt) {
            return {
                examsId,
                warningCount: 0,
            };
        }
        const requestedCount = Number(request.count);
        const existingCount = parseFocusWarningCount(attempt.note);
        const warningCount = Math.max(existingCount + 1, Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 0);
        const reason = normalizeOptionalText(request.reason) ?? "PAGE_OR_TAB_LEFT";
        const occurredAt = new Date();
        await prismaFlowly.onboardingExamAttempt.update({
            where: {
                onboardingExamAttemptId: attempt.onboardingExamAttemptId,
            },
            data: {
                note: buildFocusWarningNote({
                    existingNote: attempt.note,
                    count: warningCount,
                    reason,
                    occurredAt,
                }),
                updatedAt: occurredAt,
                updatedBy: requesterUserId,
            },
        });
        return {
            examsId,
            warningCount,
            recordedAt: occurredAt,
        };
    }
    static async submit(requesterUserId, request) {
        const examsId = normalizeOptionalText(request.examsId);
        if (!examsId) {
            throw new ResponseError(400, "Sesi ujian wajib diisi");
        }
        const employeeId = Number(requesterUserId);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            throw new ResponseError(403, "Akun ini tidak terhubung ke employee");
        }
        const session = await prismaEmployee.em_session_exams.findFirst({
            where: {
                exams_id: examsId,
                empl_id: employeeId,
            },
        });
        if (!session) {
            throw new ResponseError(404, "Sesi ujian tidak ditemukan");
        }
        if (session.is_selesai === FINISHED_FLAG) {
            return {
                examsId,
                status: "SUBMITTED",
                message: "Sesi ujian sudah pernah dikirim",
            };
        }
        const soalUrut = parseSoalUrut(session.soal_urut);
        if (soalUrut.length === 0) {
            throw new ResponseError(400, "Sesi ujian tidak memiliki soal");
        }
        const answerMap = new Map((request.answers ?? [])
            .map((answer) => ({
            questionId: Number(answer.questionId),
            answer: normalizeOptionalText(answer.answer),
        }))
            .filter((answer) => Number.isInteger(answer.questionId) && answer.questionId > 0)
            .map((answer) => [answer.questionId, answer.answer]));
        if (!request.autoSubmit) {
            const missingQuestions = soalUrut.filter((item) => !answerMap.get(item.id));
            if (missingQuestions.length > 0) {
                throw new ResponseError(400, `Lengkapi semua jawaban sebelum submit. Masih ada ${missingQuestions.length} soal belum diisi.`);
            }
        }
        const questions = await prismaEmployee.em_questions1.findMany({
            where: {
                id: {
                    in: soalUrut.map((item) => item.id),
                },
            },
            select: {
                id: true,
                correct_answer: true,
                correct_answer2: true,
                score: true,
                em_questions2: {
                    select: {
                        option_choices: true,
                        option_text: true,
                    },
                },
            },
        });
        const questionMap = new Map(questions.map((question) => [question.id, question]));
        const submittedAt = new Date();
        const answerRows = soalUrut.map((item) => {
            const answer = answerMap.get(item.id) ?? null;
            const question = questionMap.get(item.id);
            const isEssay = item.tipe === "es";
            const answer2 = question
                ? buildAnswer2Value({
                    answer,
                    isBoolean: item.tipe === "tf",
                    isEssay,
                    question,
                })
                : null;
            const score = !isEssay && question
                ? buildObjectiveScore({
                    answer,
                    answer2,
                    isBoolean: item.tipe === "tf",
                    question,
                })
                : null;
            return {
                empl_id: employeeId,
                soal_id: item.id,
                session_exams_id: examsId,
                jawaban: answer,
                jawaban2: answer2,
                waktu_jawab: submittedAt,
                Score: score,
                is_correction: isEssay ? 0 : 1,
                is_train_jawaban: false,
            };
        });
        const answeredQuestionCount = answerRows.filter((row) => row.jawaban).length;
        const correctQuestionCount = answerRows.filter((row) => Number(row.Score ?? 0) > 0).length;
        await prismaEmployee.$transaction(async (tx) => {
            await tx.em_jawaban_peserta.deleteMany({
                where: {
                    empl_id: employeeId,
                    session_exams_id: examsId,
                },
            });
            await tx.em_jawaban_peserta.createMany({
                data: answerRows,
            });
            await tx.em_session_exams.update({
                where: {
                    Id: session.Id,
                },
                data: {
                    end_time: submittedAt,
                    is_selesai: FINISHED_FLAG,
                    is_correct: 0,
                    is_notes: null,
                    is_score_akhir: null,
                },
            });
        });
        const attempt = await prismaFlowly.onboardingExamAttempt.findFirst({
            where: {
                employeeExamSessionId: examsId,
                isDeleted: false,
            },
            select: {
                onboardingExamAttemptId: true,
                onboardingAssignmentId: true,
                onboardingStageProgressId: true,
            },
        });
        if (attempt) {
            await prismaFlowly.$transaction([
                prismaFlowly.onboardingExamAttempt.update({
                    where: {
                        onboardingExamAttemptId: attempt.onboardingExamAttemptId,
                    },
                    data: {
                        submittedAt,
                        endedAt: submittedAt,
                        answeredQuestionCount,
                        correctQuestionCount,
                        status: "WAITING_ADMIN",
                        updatedAt: submittedAt,
                        updatedBy: requesterUserId,
                    },
                }),
                prismaFlowly.onboardingStageProgress.update({
                    where: {
                        onboardingStageProgressId: attempt.onboardingStageProgressId,
                    },
                    data: {
                        status: "WAITING_ADMIN",
                        completedAt: submittedAt,
                        updatedAt: submittedAt,
                        updatedBy: requesterUserId,
                    },
                }),
                prismaFlowly.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: attempt.onboardingAssignmentId,
                    },
                    data: {
                        status: "WAITING_ADMIN",
                        updatedAt: submittedAt,
                        updatedBy: requesterUserId,
                    },
                }),
            ]);
            try {
                const [employee, notificationStageProgress] = await Promise.all([
                    prismaEmployee.em_employee.findUnique({
                        where: {
                            UserId: employeeId,
                        },
                        select: {
                            UserId: true,
                            BadgeNum: true,
                            CardNo: true,
                            Name: true,
                        },
                    }),
                    getAuthorizedStageProgress(requesterUserId, attempt.onboardingStageProgressId),
                ]);
                if (employee) {
                    await enqueueExamMonitorNotification({
                        event: "FINISHED",
                        examsId,
                        employee,
                        stageProgress: notificationStageProgress,
                        occurredAt: submittedAt,
                    });
                }
            }
            catch (error) {
                logger.warn("Failed to enqueue finished onboarding exam notification", {
                    examsId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        return {
            examsId,
            status: "SUBMITTED",
            answeredQuestionCount,
            totalQuestionCount: soalUrut.length,
            message: "Ujian berhasil dikirim dan menunggu koreksi admin",
        };
    }
}
//# sourceMappingURL=onboarding-exam-runtime-service.js.map