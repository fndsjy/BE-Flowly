type OnboardingMaterialSourceFile = {
    id: number;
    title: string | null;
    fileName: string;
    url: string | null;
    orderIndex: number | null;
    fileType: number | null;
};
type OnboardingMaterialSource = {
    materialId: number;
    materialCode: string;
    materialTitle: string;
    materialDescription: string | null;
    materialTypes: string[];
    materialSequence: number | null;
    stageNumber: number;
    orderIndex: number;
    portalKeys: string[];
    assignmentNote: string | null;
    files: OnboardingMaterialSourceFile[];
};
type OnboardingMaterialPortalStageResponse = {
    onboardingStageTemplateId: string;
    stageNumber: number;
    stageLabel: string;
    stageTitle: string;
};
type OnboardingMaterialPortalResponse = {
    onboardingPortalTemplateId: string;
    portalKey: string;
    portalLabel: string;
    portalOrderIndex: number;
    stages: OnboardingMaterialPortalStageResponse[];
};
type OnboardingMaterialAssignmentResponse = {
    assignmentId: string;
    onboardingStageTemplateId: string;
    employeeMaterialId: number;
    materialCode: string;
    materialTitle: string;
    materialDescription: string | null;
    materialStatus: string | null;
    materialSequence: number | null;
    materialTypes: string[];
    fileCount: number;
    totalFileCount: number;
    selectedFileIds: number[];
    fileSelectionMode: "ALL" | "SELECTED";
    files: OnboardingMaterialSourceFile[];
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
type ListOnboardingMaterialAssignmentsResponse = {
    portals: OnboardingMaterialPortalResponse[];
    assignments: OnboardingMaterialAssignmentResponse[];
};
type CreateOnboardingStageMaterialRequest = {
    onboardingStageTemplateId: string;
    materiId: number;
    selectedFileIds?: number[];
    isRequired?: boolean;
};
type DeleteOnboardingStageMaterialRequest = {
    onboardingStageMaterialId: string;
};
export declare class OnboardingMaterialService {
    static listSourceMaterials(): Promise<OnboardingMaterialSource[]>;
    static listAssignments(requesterId: string): Promise<ListOnboardingMaterialAssignmentsResponse>;
    static createAssignment(requesterId: string, reqBody: CreateOnboardingStageMaterialRequest): Promise<{
        onboardingStageMaterialId: string;
        message: string;
    }>;
    static deleteAssignment(requesterId: string, reqBody: DeleteOnboardingStageMaterialRequest): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=onboarding-material-service.d.ts.map