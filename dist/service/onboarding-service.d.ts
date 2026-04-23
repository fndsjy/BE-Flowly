import { type AdminOnboardingMonitoringResponse, type EmployeeOnboardingSummaryResponse, type ListEmployeeOnboardingSummaryRequest, type MyOnboardingWorkspaceResponse, type StartOnboardingMaterialReadRequest, type StartOnboardingMaterialReadResponse, type StartEmployeeOnboardingRequest, type StartEmployeeOnboardingResponse } from "../model/onboarding-model.js";
export declare class OnboardingService {
    static listMyWorkspace(requesterUserId: string): Promise<MyOnboardingWorkspaceResponse>;
    static listAdminMonitoring(requesterUserId: string): Promise<AdminOnboardingMonitoringResponse>;
    static startMaterialRead(requesterUserId: string, request: StartOnboardingMaterialReadRequest): Promise<StartOnboardingMaterialReadResponse>;
    static listEmployeeSummary(requesterUserId: string, request: ListEmployeeOnboardingSummaryRequest): Promise<EmployeeOnboardingSummaryResponse[]>;
    static startEmployees(requesterUserId: string, request: StartEmployeeOnboardingRequest): Promise<StartEmployeeOnboardingResponse>;
}
//# sourceMappingURL=onboarding-service.d.ts.map