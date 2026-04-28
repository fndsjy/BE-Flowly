type SyncStageResult = {
    scheduleId: number;
    portalKey: string;
    stageCode: string;
    questionCount: number;
    summaryRowCount: number;
};
export declare class OnboardingEmployeeScheduleSyncService {
    private static getActiveQuestionTypes;
    private static getActiveStages;
    private static getQuestionsByExam;
    private static buildScheduleQuestions;
    private static buildScheduleSummaries;
    private static ensureStageSchedule;
    static syncStageByTemplateId(onboardingStageTemplateId: string): Promise<SyncStageResult | null>;
    static syncAll(): Promise<SyncStageResult[]>;
    private static sync;
}
export {};
//# sourceMappingURL=onboarding-employee-schedule-sync-service.d.ts.map