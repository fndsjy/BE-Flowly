import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { generateOnboardingStageExamId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { Validation } from "../validation/validation.js";
import { OnboardingExamValidation } from "../validation/onboarding-exam-validation.js";
import { OnboardingEmployeeScheduleSyncService } from "./onboarding-employee-schedule-sync-service.js";
const ONBOARDING_ADMIN_PORTAL_KEYS = [
    "EMPLOYEE",
    "SUPPLIER",
    "CUSTOMER",
    "AFFILIATE",
    "INFLUENCER",
    "COMMUNITY",
];
const PORTAL_ORDER_MAP = new Map(ONBOARDING_ADMIN_PORTAL_KEYS.map((portalKey, index) => [portalKey, (index + 1) * 10]));
const DEFAULT_TYPE_ORDER = [
    "MCQ",
    "ESSAY",
    "TRUE_FALSE",
    "POLLING",
];
const TYPE_ORDER_WEIGHT = new Map(DEFAULT_TYPE_ORDER.map((category, index) => [category, (index + 1) * 10]));
const normalizeOptionalText = (value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};
const normalizeUpper = (value) => (value ?? "").trim().toUpperCase();
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
    const plainText = decodeHtmlEntities(normalized
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<li>/gi, "- ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]*>/g, " "))
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ");
    return normalizeOptionalText(plainText);
};
const normalizeAnswerValue = (value) => {
    const text = stripHtml(value) ?? normalizeOptionalText(value);
    if (!text) {
        return null;
    }
    return normalizeWhitespace(text)
        .replace(/^[A-Z]\s*[\.\)\-:]\s*/i, "")
        .toLowerCase();
};
const resolveQuestionCategoryByTypeName = (typeName) => {
    const normalized = normalizeWhitespace(typeName ?? "").toLowerCase();
    if (!normalized) {
        return null;
    }
    if (normalized === "multiple choice") {
        return "MCQ";
    }
    if (normalized === "essay") {
        return "ESSAY";
    }
    if (normalized === "true/false questions" || normalized === "true/false") {
        return "TRUE_FALSE";
    }
    if (normalized === "polling") {
        return "POLLING";
    }
    return null;
};
const isTrueFalseQuestion = (options) => {
    if (options.length !== 2) {
        return false;
    }
    const normalized = options
        .map((option) => normalizeAnswerValue(option)?.replace(/^[A-Z]\s*[\.\)\-:]\s*/i, "") ?? "")
        .filter((option) => option.length > 0);
    if (normalized.length !== 2) {
        return false;
    }
    const optionSet = new Set(normalized);
    return ((optionSet.has("true") && optionSet.has("false")) ||
        (optionSet.has("benar") && optionSet.has("salah")));
};
const resolveQuestionCategory = (options) => {
    if (options.length === 0) {
        return "ESSAY";
    }
    return isTrueFalseQuestion(options) ? "TRUE_FALSE" : "MCQ";
};
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
const getPortalOrderIndex = (portalKey) => PORTAL_ORDER_MAP.get(normalizeUpper(portalKey)) ?? 999;
const buildAssignmentNote = (params) => {
    const parts = [];
    if (params.categoryCode) {
        parts.push(`Kategori employee: ${params.categoryCode}`);
    }
    if (params.description) {
        const excerpt = params.description.length > 180
            ? `${params.description.slice(0, 177).trimEnd()}...`
            : params.description;
        parts.push(excerpt);
    }
    return parts.length > 0 ? parts.join(" | ") : null;
};
const normalizeTypeOrder = (value) => {
    const allowed = new Set(DEFAULT_TYPE_ORDER);
    const fromInput = Array.isArray(value)
        ? value.filter((item) => typeof item === "string" &&
            allowed.has(item))
        : [];
    return Array.from(new Set([...fromInput, ...DEFAULT_TYPE_ORDER]));
};
const parseSelectionMetadata = (note) => {
    const normalizedNote = normalizeOptionalText(note);
    if (!normalizedNote) {
        return {
            mode: "ALL",
            selectedQuestionIds: [],
            typeOrder: DEFAULT_TYPE_ORDER,
            rawNote: null,
        };
    }
    try {
        const parsed = JSON.parse(normalizedNote);
        const selectedQuestionIds = Array.isArray(parsed?.selectedQuestionIds)
            ? Array.from(new Set(parsed.selectedQuestionIds
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)))
            : [];
        return {
            mode: parsed?.mode === "SELECTED" && selectedQuestionIds.length > 0 ? "SELECTED" : "ALL",
            selectedQuestionIds,
            typeOrder: normalizeTypeOrder(parsed?.typeOrder),
            rawNote: null,
        };
    }
    catch {
        return {
            mode: "ALL",
            selectedQuestionIds: [],
            typeOrder: DEFAULT_TYPE_ORDER,
            rawNote: normalizedNote,
        };
    }
};
const filterSelectedQuestions = (questions, metadata) => {
    if (metadata.mode !== "SELECTED" || metadata.selectedQuestionIds.length === 0) {
        return questions;
    }
    const selectedQuestionIds = new Set(metadata.selectedQuestionIds);
    const filtered = questions.filter((question) => selectedQuestionIds.has(question.questionId));
    return filtered.length > 0 ? filtered : questions;
};
const serializeSelectionNote = (sourceExam, selectedQuestionIds, typeOrder) => {
    const normalizedTypeOrder = normalizeTypeOrder(typeOrder);
    if (sourceExam.questions.length === 0) {
        return JSON.stringify({ mode: "ALL", typeOrder: normalizedTypeOrder });
    }
    if (selectedQuestionIds === undefined) {
        return JSON.stringify({ mode: "ALL", typeOrder: normalizedTypeOrder });
    }
    const allowedIds = new Set(sourceExam.questions.map((question) => question.questionId));
    const normalizedSelectedIds = Array.from(new Set(selectedQuestionIds.filter((value) => Number.isInteger(value) && value > 0 && allowedIds.has(value)))).sort((left, right) => left - right);
    if (normalizedSelectedIds.length === 0) {
        throw new ResponseError(400, "Pilih minimal satu soal dari master ujian ini");
    }
    if (normalizedSelectedIds.length === sourceExam.questions.length) {
        return JSON.stringify({ mode: "ALL", typeOrder: normalizedTypeOrder });
    }
    const payload = JSON.stringify({
        mode: "SELECTED",
        selectedQuestionIds: normalizedSelectedIds,
        typeOrder: normalizedTypeOrder,
    });
    if (payload.length > 1000) {
        throw new ResponseError(400, "Pilihan soal terlalu banyak untuk disimpan");
    }
    return payload;
};
const buildSourceExamMap = async () => {
    const [exams, questionTypes] = await Promise.all([
        prismaEmployee.em_exams.findMany({
            where: {
                Status: "A",
            },
            select: {
                id: true,
                exam_name: true,
                UserId: true,
                Status: true,
                LastUpdate: true,
                Deskripsi: true,
                FileImage: true,
                CatType: true,
            },
            orderBy: [{ exam_name: "asc" }, { id: "asc" }],
        }),
        prismaEmployee.em_questtype.findMany({
            where: {
                Status: "A",
            },
            select: {
                Id: true,
                TypeName: true,
            },
            orderBy: [{ Id: "asc" }],
        }),
    ]);
    if (exams.length === 0) {
        return new Map();
    }
    const questionTypeMap = new Map();
    for (const questionType of questionTypes) {
        const category = resolveQuestionCategoryByTypeName(questionType.TypeName);
        if (category) {
            questionTypeMap.set(questionType.Id, category);
        }
    }
    const questions = await prismaEmployee.em_questions1.findMany({
        where: {
            exam_id: {
                in: exams.map((exam) => exam.id),
            },
            OR: [{ status: "A" }, { status: null }],
        },
        select: {
            id: true,
            question_text: true,
            question_type: true,
            correct_answer: true,
            correct_answer2: true,
            exam_id: true,
            time_limit: true,
            score: true,
            em_questions2: {
                select: {
                    option_choices: true,
                    option_text: true,
                },
                orderBy: [{ option_choices: "asc" }],
            },
        },
        orderBy: [{ exam_id: "asc" }, { id: "asc" }],
    });
    const questionMap = new Map();
    for (const question of questions) {
        const examId = question.exam_id;
        if (!examId) {
            continue;
        }
        const formattedOptions = question.em_questions2
            .map((option) => {
            const label = stripHtml(option.option_text) ?? option.option_choices;
            return {
                display: `${option.option_choices}. ${label}`,
                choice: normalizeUpper(option.option_choices),
                label: normalizeAnswerValue(label),
            };
        })
            .filter((option) => normalizeOptionalText(option.display));
        const correctAnswerLookup = [
            normalizeAnswerValue(question.correct_answer2),
            normalizeAnswerValue(question.correct_answer),
        ].filter((value) => Boolean(value));
        const matchedOption = formattedOptions.find((option) => correctAnswerLookup.some((lookup) => lookup === option.label ||
            lookup === option.choice.toLowerCase())) ?? null;
        const options = formattedOptions.map((option) => option.display);
        const category = (question.question_type != null ? questionTypeMap.get(question.question_type) : null) ??
            resolveQuestionCategory(options);
        const nextQuestion = {
            questionId: question.id,
            questionCode: `Q-${question.id}`,
            category,
            prompt: stripHtml(question.question_text) ?? `Soal ${question.id}`,
            options,
            correctAnswer: matchedOption?.display ??
                stripHtml(question.correct_answer2) ??
                stripHtml(question.correct_answer) ??
                "-",
            answerGuide: stripHtml(question.correct_answer) ?? null,
            timeLimit: Number.isFinite(question.time_limit) ? question.time_limit : null,
            score: Number.isFinite(question.score) ? Number(question.score) : null,
            orderIndex: question.id,
        };
        const existingQuestions = questionMap.get(examId) ?? [];
        existingQuestions.push(nextQuestion);
        questionMap.set(examId, existingQuestions);
    }
    const sourceExamMap = new Map();
    for (const exam of exams) {
        const sourceQuestions = [...(questionMap.get(exam.id) ?? [])].sort((left, right) => left.orderIndex - right.orderIndex);
        const questionTypes = Array.from(new Set(sourceQuestions.map((question) => question.category)))
            .sort((left, right) => {
            return (TYPE_ORDER_WEIGHT.get(left) ?? 999) - (TYPE_ORDER_WEIGHT.get(right) ?? 999);
        });
        const description = stripHtml(exam.Deskripsi);
        sourceExamMap.set(exam.id, {
            examId: exam.id,
            examCode: `EXAM-${exam.id}`,
            examName: normalizeOptionalText(exam.exam_name) ?? `Ujian ${exam.id}`,
            examDescription: description,
            examImage: normalizeOptionalText(exam.FileImage),
            ownerUserId: normalizeOptionalText(exam.UserId),
            categoryCode: normalizeOptionalText(exam.CatType),
            updatedAt: exam.LastUpdate ?? null,
            questionCount: sourceQuestions.length,
            questionTypes,
            totalScore: sourceQuestions.reduce((sum, question) => sum + Number(question.score ?? 0), 0),
            questions: sourceQuestions,
            assignmentNote: buildAssignmentNote({
                categoryCode: normalizeOptionalText(exam.CatType),
                description,
            }),
        });
    }
    return sourceExamMap;
};
export class OnboardingExamService {
    static async listSourceExams() {
        const sourceExamMap = await buildSourceExamMap();
        return Array.from(sourceExamMap.values()).sort((left, right) => {
            if (left.examName !== right.examName) {
                return left.examName.localeCompare(right.examName);
            }
            return left.examId - right.examId;
        });
    }
    static async listAssignments(requesterId) {
        await ensureAdminAccess(requesterId);
        const [sourceExamMap, portalTemplates] = await Promise.all([
            buildSourceExamMap(),
            prismaFlowly.onboardingPortalTemplate.findMany({
                where: {
                    isActive: true,
                    isDeleted: false,
                },
                include: {
                    stageTemplates: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ stageOrder: "asc" }, { stageCode: "asc" }],
                        include: {
                            stageExams: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                            },
                        },
                    },
                },
            }),
        ]);
        const portals = [...portalTemplates]
            .sort((left, right) => {
            const leftOrder = getPortalOrderIndex(left.portalKey);
            const rightOrder = getPortalOrderIndex(right.portalKey);
            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }
            return left.portalName.localeCompare(right.portalName);
        })
            .map((portalTemplate) => ({
            onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
            portalKey: portalTemplate.portalKey,
            portalLabel: portalTemplate.portalName,
            portalOrderIndex: getPortalOrderIndex(portalTemplate.portalKey),
            stages: portalTemplate.stageTemplates.map((stageTemplate) => ({
                onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                stageNumber: stageTemplate.stageOrder,
                stageLabel: stageTemplate.stageName,
                stageTitle: normalizeOptionalText(stageTemplate.stageDescription) ??
                    normalizeOptionalText(stageTemplate.stageCode) ??
                    `Tahap ${stageTemplate.stageOrder}`,
            })),
        }));
        const assignments = [];
        for (const portalTemplate of portalTemplates) {
            const portalOrderIndex = getPortalOrderIndex(portalTemplate.portalKey);
            for (const stageTemplate of portalTemplate.stageTemplates) {
                for (const stageExam of stageTemplate.stageExams) {
                    const sourceExam = sourceExamMap.get(stageExam.examId) ?? null;
                    const sourceQuestions = sourceExam?.questions ?? [];
                    const selectionMetadata = parseSelectionMetadata(stageExam.note);
                    const selectedQuestions = filterSelectedQuestions(sourceQuestions, selectionMetadata);
                    assignments.push({
                        assignmentId: stageExam.onboardingStageExamId,
                        onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                        examId: stageExam.examId,
                        examCode: sourceExam?.examCode ?? `EXAM-${stageExam.examId}`,
                        examName: sourceExam?.examName ?? `Ujian ${stageExam.examId}`,
                        examDescription: sourceExam?.examDescription ?? null,
                        examImage: sourceExam?.examImage ?? null,
                        ownerUserId: sourceExam?.ownerUserId ?? null,
                        categoryCode: sourceExam?.categoryCode ?? null,
                        updatedAt: sourceExam?.updatedAt ?? null,
                        questionCount: selectedQuestions.length,
                        totalQuestionCount: sourceQuestions.length,
                        questionTypes: Array.from(new Set(selectedQuestions.map((question) => question.category))).sort((left, right) => (TYPE_ORDER_WEIGHT.get(left) ?? 999) -
                            (TYPE_ORDER_WEIGHT.get(right) ?? 999)),
                        totalScore: selectedQuestions.reduce((sum, question) => sum + Number(question.score ?? 0), 0),
                        totalSourceScore: sourceExam?.totalScore ?? 0,
                        selectedQuestionIds: selectionMetadata.mode === "SELECTED"
                            ? selectionMetadata.selectedQuestionIds
                            : sourceQuestions.map((question) => question.questionId),
                        questionSelectionMode: selectionMetadata.mode === "SELECTED" &&
                            selectedQuestions.length < sourceQuestions.length
                            ? "SELECTED"
                            : "ALL",
                        questions: selectedQuestions,
                        portalKey: portalTemplate.portalKey,
                        portalLabel: portalTemplate.portalName,
                        portalOrderIndex,
                        stageNumber: stageTemplate.stageOrder,
                        stageLabel: stageTemplate.stageName,
                        orderIndex: stageExam.orderIndex,
                        passScore: stageExam.passScore ?? null,
                        typeOrder: selectionMetadata.typeOrder,
                        assignmentNote: normalizeOptionalText(stageExam.note) ??
                            sourceExam?.assignmentNote ??
                            null,
                    });
                }
            }
        }
        assignments.sort((left, right) => {
            if (left.portalOrderIndex !== right.portalOrderIndex) {
                return left.portalOrderIndex - right.portalOrderIndex;
            }
            if (left.stageNumber !== right.stageNumber) {
                return left.stageNumber - right.stageNumber;
            }
            if (left.orderIndex !== right.orderIndex) {
                return left.orderIndex - right.orderIndex;
            }
            return left.examName.localeCompare(right.examName);
        });
        return {
            portals,
            assignments,
        };
    }
    static async createAssignment(requesterId, reqBody) {
        const request = Validation.validate(OnboardingExamValidation.CREATE_ASSIGNMENT, reqBody);
        await ensureAdminAccess(requesterId);
        const [stageTemplate, sourceExamMap] = await Promise.all([
            prismaFlowly.onboardingStageTemplate.findFirst({
                where: {
                    onboardingStageTemplateId: request.onboardingStageTemplateId,
                    isActive: true,
                    isDeleted: false,
                    portalTemplate: {
                        isActive: true,
                        isDeleted: false,
                    },
                },
                include: {
                    stageExams: {
                        where: {
                            isDeleted: false,
                        },
                        orderBy: [{ orderIndex: "desc" }],
                        take: 1,
                    },
                },
            }),
            buildSourceExamMap(),
        ]);
        if (!stageTemplate) {
            throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
        }
        const sourceExam = sourceExamMap.get(request.examId);
        if (!sourceExam) {
            throw new ResponseError(404, "Master ujian employee tidak ditemukan");
        }
        const existing = await prismaFlowly.onboardingStageExam.findFirst({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                examId: request.examId,
            },
            select: {
                onboardingStageExamId: true,
                note: true,
            },
        });
        const stageTypeOrderSource = await prismaFlowly.onboardingStageExam.findFirst({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                isActive: true,
                isDeleted: false,
            },
            orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
            select: {
                note: true,
            },
        });
        const stagePassScoreSource = await prismaFlowly.onboardingStageExam.findFirst({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                isActive: true,
                isDeleted: false,
                passScore: {
                    not: null,
                },
            },
            orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
            select: {
                passScore: true,
            },
        });
        const stagePassScore = stagePassScoreSource?.passScore ?? request.passScore ?? null;
        const now = new Date();
        const stageTypeOrder = normalizeTypeOrder(request.typeOrder ?? parseSelectionMetadata(existing?.note ?? stageTypeOrderSource?.note).typeOrder);
        const selectionNote = serializeSelectionNote(sourceExam, request.selectedQuestionIds, stageTypeOrder);
        if (existing) {
            const updated = await prismaFlowly.onboardingStageExam.update({
                where: {
                    onboardingStageExamId: existing.onboardingStageExamId,
                },
                data: {
                    passScore: stagePassScore,
                    note: selectionNote,
                    isActive: true,
                    isDeleted: false,
                    deletedAt: null,
                    deletedBy: null,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
                select: {
                    onboardingStageExamId: true,
                },
            });
            if (stagePassScore !== null) {
                await prismaFlowly.onboardingStageExam.updateMany({
                    where: {
                        onboardingStageTemplateId: request.onboardingStageTemplateId,
                        isActive: true,
                        isDeleted: false,
                    },
                    data: {
                        passScore: stagePassScore,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
            }
            await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(request.onboardingStageTemplateId);
            return {
                onboardingStageExamId: updated.onboardingStageExamId,
                message: "Master ujian onboarding berhasil diperbarui",
            };
        }
        const nextOrderIndex = (stageTemplate.stageExams[0]?.orderIndex ?? 0) + 10;
        const makeAssignmentId = await generateOnboardingStageExamId();
        const created = await prismaFlowly.onboardingStageExam.create({
            data: {
                onboardingStageExamId: makeAssignmentId(),
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                examId: request.examId,
                passScore: stagePassScore,
                orderIndex: nextOrderIndex,
                note: selectionNote,
                isActive: true,
                isDeleted: false,
                createdAt: now,
                createdBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
            select: {
                onboardingStageExamId: true,
            },
        });
        if (stagePassScore !== null) {
            await prismaFlowly.onboardingStageExam.updateMany({
                where: {
                    onboardingStageTemplateId: request.onboardingStageTemplateId,
                    isActive: true,
                    isDeleted: false,
                },
                data: {
                    passScore: stagePassScore,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
        }
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(request.onboardingStageTemplateId);
        return {
            onboardingStageExamId: created.onboardingStageExamId,
            message: "Master ujian onboarding berhasil ditambahkan",
        };
    }
    static async updateStagePassScore(requesterId, reqBody) {
        const request = Validation.validate(OnboardingExamValidation.UPDATE_STAGE_PASS_SCORE, reqBody);
        await ensureAdminAccess(requesterId);
        const stageTemplate = await prismaFlowly.onboardingStageTemplate.findFirst({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                isActive: true,
                isDeleted: false,
                portalTemplate: {
                    isActive: true,
                    isDeleted: false,
                },
            },
            select: {
                onboardingStageTemplateId: true,
            },
        });
        if (!stageTemplate) {
            throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
        }
        const now = new Date();
        const updated = await prismaFlowly.onboardingStageExam.updateMany({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                isActive: true,
                isDeleted: false,
            },
            data: {
                passScore: request.passScore,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(request.onboardingStageTemplateId);
        return {
            onboardingStageTemplateId: request.onboardingStageTemplateId,
            passScore: request.passScore,
            updatedCount: updated.count,
            message: updated.count > 0
                ? "Passing score tahap berhasil diperbarui"
                : "Passing score akan dipakai saat soal pertama ditambahkan",
        };
    }
    static async updateStageTypeOrder(requesterId, reqBody) {
        const request = Validation.validate(OnboardingExamValidation.UPDATE_STAGE_TYPE_ORDER, reqBody);
        await ensureAdminAccess(requesterId);
        const stageExams = await prismaFlowly.onboardingStageExam.findMany({
            where: {
                onboardingStageTemplateId: request.onboardingStageTemplateId,
                isActive: true,
                isDeleted: false,
            },
            orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
            select: {
                onboardingStageExamId: true,
                examId: true,
                note: true,
            },
        });
        if (stageExams.length === 0) {
            throw new ResponseError(400, "Tambahkan soal tahap ini sebelum mengatur urutan tipe soal");
        }
        const sourceExamMap = await buildSourceExamMap();
        const typeOrder = normalizeTypeOrder(request.typeOrder);
        const now = new Date();
        await prismaFlowly.$transaction(stageExams.map((stageExam) => {
            const sourceExam = sourceExamMap.get(stageExam.examId);
            if (!sourceExam) {
                throw new ResponseError(404, `Master ujian ${stageExam.examId} tidak ditemukan`);
            }
            const selectionMetadata = parseSelectionMetadata(stageExam.note);
            return prismaFlowly.onboardingStageExam.update({
                where: {
                    onboardingStageExamId: stageExam.onboardingStageExamId,
                },
                data: {
                    note: serializeSelectionNote(sourceExam, selectionMetadata.mode === "SELECTED"
                        ? selectionMetadata.selectedQuestionIds
                        : undefined, typeOrder),
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
        }));
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(request.onboardingStageTemplateId);
        return {
            onboardingStageTemplateId: request.onboardingStageTemplateId,
            typeOrder,
            message: "Urutan tipe soal tahap berhasil diperbarui",
        };
    }
    static async deleteAssignment(requesterId, reqBody) {
        const request = Validation.validate(OnboardingExamValidation.DELETE_ASSIGNMENT, reqBody);
        await ensureAdminAccess(requesterId);
        const existing = await prismaFlowly.onboardingStageExam.findUnique({
            where: {
                onboardingStageExamId: request.onboardingStageExamId,
            },
            select: {
                onboardingStageExamId: true,
                onboardingStageTemplateId: true,
                isDeleted: true,
            },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Ujian onboarding tidak ditemukan");
        }
        const now = new Date();
        await prismaFlowly.onboardingStageExam.update({
            where: {
                onboardingStageExamId: request.onboardingStageExamId,
            },
            data: {
                isActive: false,
                isDeleted: true,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(existing.onboardingStageTemplateId);
        return {
            onboardingStageExamId: request.onboardingStageExamId,
            message: "Ujian onboarding berhasil dihapus",
        };
    }
}
//# sourceMappingURL=onboarding-exam-service.js.map