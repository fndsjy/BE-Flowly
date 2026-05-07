import { OnboardingMaterialService } from "./onboarding-material-service.js";
type CreateOnboardingStageRequest = {
    onboardingPortalTemplateId: string;
    stageName: string;
    stageDescription?: string | null;
};
type UpdateOnboardingStageRequest = {
    onboardingStageTemplateId: string;
    stageName?: string;
    stageDescription?: string | null;
    isActive?: boolean;
};
type DeleteOnboardingStageRequest = {
    onboardingStageTemplateId: string;
};
type OnboardingStageTemplateResponse = {
    onboardingStageTemplateId: string;
    stageOrder: number;
    stageCode: string;
    stageName: string;
    stageDescription: string | null;
    isActive: boolean;
    materialCount: number;
    examCount: number;
    progressCount: number;
};
type OnboardingStagePortalResponse = {
    onboardingPortalTemplateId: string;
    portalKey: string;
    portalName: string;
    defaultDurationDay: number;
    isActive: boolean;
    totalStageCount: number;
    stages: OnboardingStageTemplateResponse[];
};
type ListOnboardingStagesResponse = {
    portals: OnboardingStagePortalResponse[];
};
type CustomerLearningMaterialFileResponse = {
    id: number;
    title: string | null;
    fileName: string;
    url: string | null;
    fileType: number | null;
    onboardingMaterialProgressId: string | null;
    status: string;
    readAt: Date | null;
    lastReadAt: Date | null;
    completedAt: Date | null;
    openCount: number;
};
type CustomerLearningMaterialResponse = {
    onboardingStageMaterialId: string;
    onboardingAssignmentId: string | null;
    onboardingStageProgressId: string | null;
    materialId: number;
    materialCode: string;
    materialTitle: string;
    materialDescription: string | null;
    isRequired: boolean;
    orderIndex: number;
    fileCount: number;
    firstFileUrl: string | null;
    status: string;
    readAt: Date | null;
    lastReadAt: Date | null;
    completedAt: Date | null;
    openCount: number;
    files: CustomerLearningMaterialFileResponse[];
};
type CustomerLearningStageResponse = {
    onboardingStageTemplateId: string;
    onboardingStageProgressId: string | null;
    stageOrder: number;
    stageCode: string;
    stageName: string;
    stageDescription: string | null;
    materialCount: number;
    firstMaterialUrl: string | null;
    materials: CustomerLearningMaterialResponse[];
};
type CustomerLearningStagesResponse = {
    portal: {
        onboardingPortalTemplateId: string;
        portalKey: string;
        portalName: string;
    } | null;
    stages: CustomerLearningStageResponse[];
};
type CustomerLearningStagesRequest = {
    custId?: string | null;
    bypassProgramFilter?: boolean;
};
type CustomerLearningFileOpenRequest = {
    onboardingAssignmentId?: string | null;
    onboardingStageProgressId?: string | null;
    onboardingStageMaterialId?: string | null;
    sourceFileId?: number | string | null;
    fileName?: string | null;
    fileTitle?: string | null;
};
type CustomerLearningFileOpenResponse = {
    tracked: boolean;
    onboardingMaterialProgressId: string | null;
    onboardingAssignmentId: string | null;
    onboardingStageProgressId: string | null;
    onboardingStageMaterialId: string | null;
    sourceFileId: number | null;
    status: string | null;
    stageStatus: string | null;
    readAt: Date | null;
    lastReadAt: Date | null;
    openCount: number;
};
type CustomerLearningFileAccessRequest = CustomerLearningStagesRequest & CustomerLearningFileOpenRequest;
type CustomerLearningSourceFile = Awaited<ReturnType<typeof OnboardingMaterialService.listSourceMaterials>>[number]["files"][number];
type CustomerLearningFileAccessResponse = {
    onboardingStageTemplateId: string;
    onboardingStageMaterialId: string;
    materialId: number;
    sourceFile: CustomerLearningSourceFile;
};
export declare class OnboardingStageService {
    static list(requesterId: string): Promise<ListOnboardingStagesResponse>;
    static listCustomerLearningStages(request?: CustomerLearningStagesRequest): Promise<CustomerLearningStagesResponse>;
    static authorizeCustomerLearningFileAccess(request: CustomerLearningFileAccessRequest): Promise<CustomerLearningFileAccessResponse>;
    static recordCustomerLearningFileOpen(custId: string, request: CustomerLearningFileOpenRequest): Promise<CustomerLearningFileOpenResponse>;
    static create(requesterId: string, request: CreateOnboardingStageRequest): Promise<{
        onboardingStageTemplateId: string;
        message: string;
    }>;
    static update(requesterId: string, request: UpdateOnboardingStageRequest): Promise<{
        onboardingStageTemplateId: string;
        message: string;
    }>;
    static delete(requesterId: string, request: DeleteOnboardingStageRequest): Promise<{
        onboardingStageTemplateId: string;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=onboarding-stage-service.d.ts.map