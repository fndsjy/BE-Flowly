import { prismaEmployee, prismaFlowly } from "../application/database.js";

const ONBOARDING_BATCH_CODE = "ONB";
const SYSTEM_USER = "SYS";
const AUTO_START_DATE = new Date("2026-01-01T00:00:00.000Z");

type QuestionSelectionMode = "ALL" | "SELECTED";
type QuestionCategory = "MCQ" | "ESSAY" | "TRUE_FALSE" | "POLLING";

const DEFAULT_TYPE_ORDER: QuestionCategory[] = [
  "MCQ",
  "ESSAY",
  "TRUE_FALSE",
  "POLLING",
];

type QuestionSelectionMetadata = {
  mode: QuestionSelectionMode;
  selectedQuestionIds: number[];
  typeOrder: QuestionCategory[];
};

type EmployeeQuestion = {
  id: number;
  exam_id: number | null;
  question_type: number | null;
  time_limit: number;
};

type ScheduleQuestionRow = {
  scheduleId: number;
  soalId: number;
  urutanSoal: number;
  materiId: number | null;
  urutanTipeSoal: number;
  tipeSoal: number;
  durationSecond: number;
};

type SyncStageResult = {
  scheduleId: number;
  portalKey: string;
  stageCode: string;
  questionCount: number;
  summaryRowCount: number;
};

const normalizeOptionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? value.slice(0, maxLength) : value;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const resolveQuestionCategoryByTypeName = (
  typeName: string | null | undefined
): QuestionCategory | null => {
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

const normalizeTypeOrder = (value: unknown): QuestionCategory[] => {
  const allowed = new Set(DEFAULT_TYPE_ORDER);
  const fromInput = Array.isArray(value)
    ? value.filter(
        (item): item is QuestionCategory =>
          typeof item === "string" && allowed.has(item as QuestionCategory)
      )
    : [];
  return Array.from(new Set([...fromInput, ...DEFAULT_TYPE_ORDER]));
};

const parseSelectionMetadata = (
  note: string | null | undefined
): QuestionSelectionMetadata => {
  const normalizedNote = normalizeOptionalText(note);
  if (!normalizedNote) {
    return {
      mode: "ALL",
      selectedQuestionIds: [],
      typeOrder: DEFAULT_TYPE_ORDER,
    };
  }

  try {
    const parsed = JSON.parse(normalizedNote) as {
      mode?: unknown;
      selectedQuestionIds?: unknown;
      typeOrder?: unknown;
    };

    const selectedQuestionIds = Array.isArray(parsed.selectedQuestionIds)
      ? Array.from(
          new Set(
            parsed.selectedQuestionIds
              .map((value) => Number(value))
              .filter((value) => Number.isInteger(value) && value > 0)
          )
        )
      : [];

    return {
      mode: parsed.mode === "SELECTED" && selectedQuestionIds.length > 0 ? "SELECTED" : "ALL",
      selectedQuestionIds,
      typeOrder: normalizeTypeOrder(parsed.typeOrder),
    };
  } catch {
    return {
      mode: "ALL",
      selectedQuestionIds: [],
      typeOrder: DEFAULT_TYPE_ORDER,
    };
  }
};

const getScheduleName = (portalKey: string, stageCode: string) =>
  truncate(`ONBOARDING|${portalKey}|${stageCode}`, 255);

const getScheduleDescription = (params: {
  portalKey: string;
  portalName: string;
  stageCode: string;
  stageName: string;
}) =>
  [
    `<p>Auto schedule onboarding untuk portal ${params.portalName}.</p>`,
    `<p>Portal: ${params.portalKey}</p>`,
    `<p>Tahap: ${params.stageCode} - ${params.stageName}</p>`,
  ].join("");

const groupQuestionsByExam = (questions: EmployeeQuestion[]) => {
  const grouped = new Map<number, EmployeeQuestion[]>();

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
  private static async getActiveQuestionTypes() {
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
      categories: new Map(
        rows.map((row) => [
          row.Id,
          resolveQuestionCategoryByTypeName(row.TypeName),
        ] as const)
      ),
    };
  }

  private static async getActiveStages(onboardingStageTemplateId?: string) {
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

  private static async getQuestionsByExam(examIds: number[]) {
    if (examIds.length === 0) {
      return new Map<number, EmployeeQuestion[]>();
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

  private static buildScheduleQuestions(params: {
    scheduleId: number;
    stageExams: Array<{
      examId: number;
      note: string | null;
    }>;
    questionsByExam: Map<number, EmployeeQuestion[]>;
    questionTypeCategories: Map<number, QuestionCategory | null>;
  }) {
    const rows: ScheduleQuestionRow[] = [];
    const tipeOrderCounter = new Map<number, number>();
    const stageTypeOrder = normalizeTypeOrder(
      parseSelectionMetadata(params.stageExams[0]?.note).typeOrder
    );
    const typeOrderWeight = new Map(
      stageTypeOrder.map((category, index) => [category, (index + 1) * 10])
    );
    const groupedByType = new Map<
      number,
      Array<{
        stageExam: { examId: number };
        question: EmployeeQuestion;
      }>
    >();

    for (const stageExam of params.stageExams) {
      const sourceQuestions = params.questionsByExam.get(stageExam.examId) ?? [];
      const selection = parseSelectionMetadata(stageExam.note);
      const selectedQuestionSet = new Set(selection.selectedQuestionIds);
      const selectedQuestions =
        selection.mode === "SELECTED" && selectedQuestionSet.size > 0
          ? sourceQuestions.filter((question) => selectedQuestionSet.has(question.id))
          : sourceQuestions;
      const questionsToUse = selectedQuestions.length > 0 ? selectedQuestions : sourceQuestions;

      for (const question of questionsToUse) {
        const tipeSoal =
          question.question_type != null && Number.isInteger(question.question_type)
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

  private static buildScheduleSummaries(params: {
    questions: ScheduleQuestionRow[];
    activeQuestionTypes: number[];
  }) {
    const stats = new Map<number, { count: number; totalSecond: number }>();

    for (const question of params.questions) {
      const existing = stats.get(question.tipeSoal) ?? { count: 0, totalSecond: 0 };
      existing.count += 1;
      existing.totalSecond += question.durationSecond;
      stats.set(question.tipeSoal, existing);
    }

    const allTypes = Array.from(
      new Set([
        ...params.activeQuestionTypes,
        ...Array.from(stats.keys()).filter((typeId) => typeId > 0),
      ])
    ).sort((left, right) => left - right);

    return allTypes.map((tipeSoal) => {
      const stat = stats.get(tipeSoal);
      return {
        tipeSoal,
        jumlahSoal: stat?.count ?? 0,
        durasiPerTipe: stat ? Math.ceil(stat.totalSecond / 60) : 0,
      };
    });
  }

  private static async ensureStageSchedule(params: {
    portalKey: string;
    portalName: string;
    stageCode: string;
    stageName: string;
    primaryExamId: number | null;
    hasQuestions: boolean;
  }) {
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

  static async syncStageByTemplateId(
    onboardingStageTemplateId: string
  ): Promise<SyncStageResult | null> {
    const results = await this.sync({ onboardingStageTemplateId });
    return results[0] ?? null;
  }

  static async syncAll(): Promise<SyncStageResult[]> {
    return this.sync({});
  }

  private static async sync(params: {
    onboardingStageTemplateId?: string;
  }): Promise<SyncStageResult[]> {
    const stages = await this.getActiveStages(params.onboardingStageTemplateId);
    if (stages.length === 0) {
      return [];
    }

    const activeQuestionTypes = await this.getActiveQuestionTypes();
    const examIds = Array.from(
      new Set(
        stages.flatMap((stage) => stage.stageExams.map((stageExam) => stageExam.examId))
      )
    );
    const questionsByExam = await this.getQuestionsByExam(examIds);
    const results: SyncStageResult[] = [];

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
        hasQuestions: stage.stageExams.some(
          (stageExam) => (questionsByExam.get(stageExam.examId) ?? []).length > 0
        ),
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
