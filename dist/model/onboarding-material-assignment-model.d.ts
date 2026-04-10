export type OnboardingMaterialAssignmentFileResponse = {
    id: number;
    title: string | null;
    fileName: string;
    url: string | null;
    orderIndex: number | null;
};
export type OnboardingMaterialAssignmentResponse = {
    assignmentId: string;
    employeeMaterialId: number;
    materialCode: string;
    materialTitle: string;
    materialDescription: string | null;
    materialStatus: string | null;
    materialSequence: number | null;
    materialTypes: string[];
    fileCount: number;
    files: OnboardingMaterialAssignmentFileResponse[];
    portalKey: string;
    portalLabel: string;
    portalOrderIndex: number;
    stageNumber: number;
    stageLabel: string;
    orderIndex: number;
    isRequired: boolean;
    assignmentNote: string | null;
    sharedPortalCount: number;
};
export type OnboardingMaterialAssignmentSummaryResponse = {
    uniqueMaterials: number;
    totalAssignments: number;
    multiPortalMaterials: number;
    activePortals: number;
};
export type ListOnboardingMaterialAssignmentResponse = {
    data: OnboardingMaterialAssignmentResponse[];
    summary: OnboardingMaterialAssignmentSummaryResponse;
};
export type ListOnboardingMaterialAssignmentRequest = {
    portalKey?: string;
    stageNumber?: number;
    q?: string;
    includeFiles?: boolean;
};
//# sourceMappingURL=onboarding-material-assignment-model.d.ts.map