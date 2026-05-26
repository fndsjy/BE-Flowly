type StartRuntimeExamRequest = {
    onboardingStageProgressId?: string;
};
type SubmitRuntimeExamRequest = {
    examsId?: string;
    autoSubmit?: boolean;
    answers?: Array<{
        questionId?: number;
        answer?: string | null;
    }>;
};
type TestAutofillRuntimeExamRequest = {
    onboardingStageProgressId?: string;
    score?: number | string | null;
};
type SaveRuntimeExamAnswerRequest = {
    examsId?: string;
    questionId?: number;
    answer?: string | null;
};
type RuntimeExamWarningRequest = {
    examsId?: string;
    reason?: string | null;
    count?: number;
};
type RuntimeQuestionType = "mcq" | "boolean" | "essay";
export declare class OnboardingExamRuntimeService {
    static start(requesterUserId: string, request: StartRuntimeExamRequest): Promise<{
        onboardingStageProgressId: string;
        session: {
            id: number;
            scheduleId: number | null;
            examsId: string | null;
            startTime: Date | null;
            endTime: Date | null;
            tokenExpiresAt: Date | null;
            durationSeconds: number;
            durationMinutes: number;
            isFinished: boolean;
        };
        questions: {
            questionId: number;
            orderIndex: number;
            type: RuntimeQuestionType;
            legacyType: "pg" | "tf" | "es";
            prompt: string;
            options: {
                value: string;
                label: string;
                display: string;
            }[];
            helper: string;
            timeLimitSeconds: number;
        }[];
        answers: {
            questionId: number;
            answer: string | null;
        }[];
    }>;
    private static startUnlocked;
    static saveAnswer(requesterUserId: string, request: SaveRuntimeExamAnswerRequest): Promise<{
        examsId: string;
        questionId: number;
        saved: boolean;
        savedAt: Date;
    }>;
    static recordWarning(requesterUserId: string, request: RuntimeExamWarningRequest): Promise<{
        examsId: string;
        warningCount: number;
        recordedAt?: never;
    } | {
        examsId: string;
        warningCount: number;
        recordedAt: Date;
    }>;
    static testAutofill(requesterUserId: string, request: TestAutofillRuntimeExamRequest): Promise<{
        onboardingStageProgressId: string;
        examsId: string;
        employeeId: number;
        status: string;
        score: number;
        answeredQuestionCount: number;
        totalQuestionCount: number;
        message: string;
    }>;
    static submit(requesterUserId: string, request: SubmitRuntimeExamRequest): Promise<{
        examsId: string;
        status: string;
        message: string;
        answeredQuestionCount?: never;
        totalQuestionCount?: never;
    } | {
        examsId: string;
        status: string;
        answeredQuestionCount: number;
        totalQuestionCount: number;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=onboarding-exam-runtime-service.d.ts.map