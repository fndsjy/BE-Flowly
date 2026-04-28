type AdminOnboardingExamQuestionCategory = "MCQ" | "ESSAY" | "TRUE_FALSE" | "POLLING";
type OnboardingExamQuestionResponse = {
    questionId: number;
    questionCode: string;
    category: AdminOnboardingExamQuestionCategory;
    prompt: string;
    options: string[];
    correctAnswer: string;
    answerGuide: string | null;
    timeLimit: number | null;
    score: number | null;
    orderIndex: number;
};
type OnboardingSourceExamResponse = {
    examId: number;
    examCode: string;
    examName: string;
    examDescription: string | null;
    examImage: string | null;
    ownerUserId: string | null;
    categoryCode: string | null;
    updatedAt: Date | null;
    questionCount: number;
    questionTypes: AdminOnboardingExamQuestionCategory[];
    totalScore: number;
    questions: OnboardingExamQuestionResponse[];
    assignmentNote: string | null;
};
type OnboardingExamPortalStageResponse = {
    onboardingStageTemplateId: string;
    stageNumber: number;
    stageLabel: string;
    stageTitle: string;
};
type OnboardingExamPortalResponse = {
    onboardingPortalTemplateId: string;
    portalKey: string;
    portalLabel: string;
    portalOrderIndex: number;
    stages: OnboardingExamPortalStageResponse[];
};
type OnboardingExamAssignmentResponse = {
    assignmentId: string;
    onboardingStageTemplateId: string;
    examId: number;
    examCode: string;
    examName: string;
    examDescription: string | null;
    examImage: string | null;
    ownerUserId: string | null;
    categoryCode: string | null;
    updatedAt: Date | null;
    questionCount: number;
    totalQuestionCount: number;
    questionTypes: AdminOnboardingExamQuestionCategory[];
    totalScore: number;
    totalSourceScore: number;
    selectedQuestionIds: number[];
    questionSelectionMode: "ALL" | "SELECTED";
    questions: OnboardingExamQuestionResponse[];
    portalKey: string;
    portalLabel: string;
    portalOrderIndex: number;
    stageNumber: number;
    stageLabel: string;
    orderIndex: number;
    passScore: number | null;
    typeOrder: AdminOnboardingExamQuestionCategory[];
    assignmentNote: string | null;
};
type ListOnboardingExamAssignmentsResponse = {
    portals: OnboardingExamPortalResponse[];
    assignments: OnboardingExamAssignmentResponse[];
};
type CreateOnboardingStageExamRequest = {
    onboardingStageTemplateId: string;
    examId: number;
    passScore?: number | null;
    selectedQuestionIds?: number[];
    typeOrder?: AdminOnboardingExamQuestionCategory[];
};
type UpdateOnboardingStagePassScoreRequest = {
    onboardingStageTemplateId: string;
    passScore: number;
};
type UpdateOnboardingStageTypeOrderRequest = {
    onboardingStageTemplateId: string;
    typeOrder: AdminOnboardingExamQuestionCategory[];
};
type DeleteOnboardingStageExamRequest = {
    onboardingStageExamId: string;
};
export declare class OnboardingExamService {
    static listSourceExams(): Promise<OnboardingSourceExamResponse[]>;
    static listAssignments(requesterId: string): Promise<ListOnboardingExamAssignmentsResponse>;
    static createAssignment(requesterId: string, reqBody: CreateOnboardingStageExamRequest): Promise<{
        onboardingStageExamId: string;
        message: string;
    }>;
    static updateStagePassScore(requesterId: string, reqBody: UpdateOnboardingStagePassScoreRequest): Promise<{
        onboardingStageTemplateId: string;
        passScore: number;
        updatedCount: number;
        message: string;
    }>;
    static updateStageTypeOrder(requesterId: string, reqBody: UpdateOnboardingStageTypeOrderRequest): Promise<{
        onboardingStageTemplateId: string;
        typeOrder: AdminOnboardingExamQuestionCategory[];
        message: string;
    }>;
    static deleteAssignment(requesterId: string, reqBody: DeleteOnboardingStageExamRequest): Promise<{
        onboardingStageExamId: string;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=onboarding-exam-service.d.ts.map