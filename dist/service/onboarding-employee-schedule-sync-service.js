import { prismaEmployee, prismaFlowly } from "../application/database.js";
const ONBOARDING_BATCH_CODE = "ONB";
const SYSTEM_USER = "SYS";
const AUTO_START_DATE = new Date("2026-01-01T00:00:00.000Z");
const DEFAULT_TYPE_ORDER = [
    "MCQ",
    "ESSAY",
    "TRUE_FALSE",
    "POLLING",
];
const normalizeOptionalText = (value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};
const truncate = (value, maxLength) => value.length > maxLength ? value.slice(0, maxLength) : value;
const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();
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
const normalizeTypeOrder = (value) => {
    const allowed = new Set(DEFAULT_TYPE_ORDER);
    const fromInput = Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && allowed.has(item))
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
            typeOrder: normalizeTypeOrder(parsed.typeOrder),
        };
    }
    catch {
        return {
            mode: "ALL",
            selectedQuestionIds: [],
            typeOrder: DEFAULT_TYPE_ORDER,
        };
    }
};
const getScheduleName = (portalKey, stageCode) => truncate(`ONBOARDING|${portalKey}|${stageCode}`, 255);
const getScheduleDescription = (params) => [
    `<p>Auto schedule onboarding untuk portal ${params.portalName}.</p>`,
    `<p>Portal: ${params.portalKey}</p>`,
    `<p>Tahap: ${params.stageCode} - ${params.stageName}</p>`,
].join("");
const groupQuestionsByExam = (questions) => {
    const grouped = new Map();
    for (const question of questions) {
        if (!question.exam_id) {
            continue;
        }
        const rows = grouped.get(question.exam_id) ?? [];
        rows.push(question);
        grouped.set(question.exam_id, rows);
    }
    return grouped;
};
export class OnboardingEmployeeScheduleSyncService {
    static async getActiveQuestionTypes() {
        const rows = await prismaEmployee.em_questtype.findMany({
            where: {
                Status: "A",
            },
            select: {
                Id: true,
                TypeName: true,
            },
            orderBy: [{ Id: "asc" }],
        });
        return {
            ids: rows.map((row) => row.Id),
            categories: new Map(rows.map((row) => [
                row.Id,
                resolveQuestionCategoryByTypeName(row.TypeName),
            ])),
        };
    }
    static async getActiveStages(onboardingStageTemplateId) {
        return prismaFlowly.onboardingStageTemplate.findMany({
            where: {
                ...(onboardingStageTemplateId ? { onboardingStageTemplateId } : {}),
                isActive: true,
                isDeleted: false,
                portalTemplate: {
                    isActive: true,
                    isDeleted: false,
                },
            },
            include: {
                portalTemplate: true,
                stageExams: {
                    where: {
                        isActive: true,
                        isDeleted: false,
                    },
                    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                },
            },
            orderBy: [
                { portalTemplate: { portalKey: "asc" } },
                { stageOrder: "asc" },
                { stageCode: "asc" },
            ],
        });
    }
    static async getQuestionsByExam(examIds) {
        if (examIds.length === 0) {
            return new Map();
        }
        const questions = await prismaEmployee.em_questions1.findMany({
            where: {
                exam_id: {
                    in: examIds,
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
        });
        return groupQuestionsByExam(questions);
    }
    static buildScheduleQuestions(params) {
        const rows = [];
        const tipeOrderCounter = new Map();
        const stageTypeOrder = normalizeTypeOrder(parseSelectionMetadata(params.stageExams[0]?.note).typeOrder);
        const typeOrderWeight = new Map(stageTypeOrder.map((category, index) => [category, (index + 1) * 10]));
        const groupedByType = new Map();
        for (const stageExam of params.stageExams) {
            const sourceQuestions = params.questionsByExam.get(stageExam.examId) ?? [];
            const selection = parseSelectionMetadata(stageExam.note);
            const selectedQuestionSet = new Set(selection.selectedQuestionIds);
            const selectedQuestions = selection.mode === "SELECTED" && selectedQuestionSet.size > 0
                ? sourceQuestions.filter((question) => selectedQuestionSet.has(question.id))
                : sourceQuestions;
            const questionsToUse = selectedQuestions.length > 0 ? selectedQuestions : sourceQuestions;
            for (const question of questionsToUse) {
                const tipeSoal = question.question_type != null && Number.isInteger(question.question_type)
                    ? question.question_type
                    : 0;
                const group = groupedByType.get(tipeSoal) ?? [];
                group.push({
                    stageExam,
                    question,
                });
                groupedByType.set(tipeSoal, group);
            }
        }
        const sortedTypeIds = Array.from(groupedByType.keys()).sort((left, right) => {
            const leftCategory = params.questionTypeCategories.get(left);
            const rightCategory = params.questionTypeCategories.get(right);
            const leftWeight = leftCategory ? typeOrderWeight.get(leftCategory) ?? 999 : 999;
            const rightWeight = rightCategory ? typeOrderWeight.get(rightCategory) ?? 999 : 999;
            if (leftWeight !== rightWeight) {
                return leftWeight - rightWeight;
            }
            return left - right;
        });
        for (const tipeSoal of sortedTypeIds) {
            const questionsToUse = groupedByType.get(tipeSoal) ?? [];
            for (const item of questionsToUse) {
                const nextTipeOrder = (tipeOrderCounter.get(tipeSoal) ?? 0) + 1;
                tipeOrderCounter.set(tipeSoal, nextTipeOrder);
                rows.push({
                    scheduleId: params.scheduleId,
                    soalId: item.question.id,
                    urutanSoal: rows.length + 1,
                    materiId: null,
                    urutanTipeSoal: nextTipeOrder,
                    tipeSoal,
                    durationSecond: Number.isFinite(item.question.time_limit)
                        ? item.question.time_limit
                        : 0,
                });
            }
        }
        return rows;
    }
    static buildScheduleSummaries(params) {
        const stats = new Map();
        for (const question of params.questions) {
            const existing = stats.get(question.tipeSoal) ?? { count: 0, totalSecond: 0 };
            existing.count += 1;
            existing.totalSecond += question.durationSecond;
            stats.set(question.tipeSoal, existing);
        }
        const allTypes = Array.from(new Set([
            ...params.activeQuestionTypes,
            ...Array.from(stats.keys()).filter((typeId) => typeId > 0),
        ])).sort((left, right) => left - right);
        return allTypes.map((tipeSoal) => {
            const stat = stats.get(tipeSoal);
            return {
                tipeSoal,
                jumlahSoal: stat?.count ?? 0,
                durasiPerTipe: stat ? Math.ceil(stat.totalSecond / 60) : 0,
            };
        });
    }
    static async ensureStageSchedule(params) {
        const now = new Date();
        const scheName = getScheduleName(params.portalKey, params.stageCode);
        const existing = await prismaEmployee.em_schedule1.findFirst({
            where: {
                scheName,
                is_batch: ONBOARDING_BATCH_CODE,
            },
            select: {
                Id: true,
            },
            orderBy: [{ Id: "asc" }],
        });
        const data = {
            scheDeskripsi: getScheduleDescription(params),
            isMateri: null,
            isQuota: null,
            startDate: AUTO_START_DATE,
            endDate: null,
            startTime: "00:00",
            endTime: "23:59",
            isLokasi: "Self Learning",
            isTrainer: "System",
            status: "F",
            lastupdate: now,
            sendWA: 0,
            ujian_stats: "A",
            is_with_soal: params.hasQuestions ? "Y" : "N",
            usr_by: SYSTEM_USER,
            is_wa_template: 0,
            is_batch: ONBOARDING_BATCH_CODE,
            event_id: null,
        };
        if (existing) {
            const updated = await prismaEmployee.em_schedule1.update({
                where: {
                    Id: existing.Id,
                },
                data,
                select: {
                    Id: true,
                },
            });
            return updated.Id;
        }
        const created = await prismaEmployee.em_schedule1.create({
            data: {
                scheName,
                ...data,
                created_at: now,
            },
            select: {
                Id: true,
            },
        });
        return created.Id;
    }
    static async syncStageByTemplateId(onboardingStageTemplateId) {
        const results = await this.sync({ onboardingStageTemplateId });
        return results[0] ?? null;
    }
    static async syncAll() {
        return this.sync({});
    }
    static async sync(params) {
        const stages = await this.getActiveStages(params.onboardingStageTemplateId);
        if (stages.length === 0) {
            return [];
        }
        const activeQuestionTypes = await this.getActiveQuestionTypes();
        const examIds = Array.from(new Set(stages.flatMap((stage) => stage.stageExams.map((stageExam) => stageExam.examId))));
        const questionsByExam = await this.getQuestionsByExam(examIds);
        const results = [];
        for (const stage of stages) {
            const primaryExamId = stage.stageExams[0]?.examId ?? null;
            const portalKey = stage.portalTemplate.portalKey;
            const portalName = stage.portalTemplate.portalName;
            const scheduleId = await this.ensureStageSchedule({
                portalKey,
                portalName,
                stageCode: stage.stageCode,
                stageName: stage.stageName,
                primaryExamId,
                hasQuestions: stage.stageExams.some((stageExam) => (questionsByExam.get(stageExam.examId) ?? []).length > 0),
            });
            const scheduleQuestions = this.buildScheduleQuestions({
                scheduleId,
                stageExams: stage.stageExams,
                questionsByExam,
                questionTypeCategories: activeQuestionTypes.categories,
            });
            const summaries = this.buildScheduleSummaries({
                questions: scheduleQuestions,
                activeQuestionTypes: activeQuestionTypes.ids,
            });
            await prismaEmployee.$transaction(async (tx) => {
                await tx.em_schedule3.deleteMany({
                    where: {
                        scheduleId,
                    },
                });
                await tx.em_schedule4.deleteMany({
                    where: {
                        scheduleId,
                    },
                });
                if (scheduleQuestions.length > 0) {
                    await tx.em_schedule3.createMany({
                        data: scheduleQuestions.map((question) => ({
                            scheduleId: question.scheduleId,
                            soalId: question.soalId,
                            urutanSoal: question.urutanSoal,
                            materiId: question.materiId,
                            urutanTipeSoal: question.urutanTipeSoal,
                            tipeSoal: question.tipeSoal,
                        })),
                    });
                }
                if (summaries.length > 0) {
                    await tx.em_schedule4.createMany({
                        data: summaries.map((summary) => ({
                            scheduleId,
                            tipeSoal: summary.tipeSoal,
                            jumlahSoal: summary.jumlahSoal,
                            durasiPerTipe: summary.durasiPerTipe,
                        })),
                    });
                }
            });
            results.push({
                scheduleId,
                portalKey,
                stageCode: stage.stageCode,
                questionCount: scheduleQuestions.length,
                summaryRowCount: summaries.length,
            });
        }
        return results;
    }
}
//# sourceMappingURL=onboarding-employee-schedule-sync-service.js.map