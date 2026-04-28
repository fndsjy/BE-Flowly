type SyncReleasedResultsOptions = {
    participantReferenceIds?: string[];
    portalKeys?: string[];
    examSessionIds?: string[];
};
export declare class OnboardingExamResultSyncService {
    static syncReleasedResults(options?: SyncReleasedResultsOptions): Promise<{
        synced: number;
    }>;
}
export {};
//# sourceMappingURL=onboarding-exam-result-sync-service.d.ts.map