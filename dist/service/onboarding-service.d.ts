import { type AdminOnboardingMonitoringResponse, type CancelEmployeeOnboardingRequest, type CancelEmployeeOnboardingResponse, type DecideOnboardingRequest, type DecideOnboardingResponse, type EmployeeOnboardingSummaryResponse, type ListEmployeeOnboardingSummaryRequest, type MyOnboardingWorkspaceResponse, type StartOnboardingMaterialReadRequest, type StartOnboardingMaterialReadResponse, type StartEmployeeOnboardingRequest, type StartEmployeeOnboardingResponse } from "../model/onboarding-model.js";
type OnboardingMonitoringOptions = {
    skipAdminAccess?: boolean;
    portalKeys?: string[];
    participantEmployeeIds?: number[];
};
export declare class OnboardingService {
    static expireOverdueAssignments(options?: {
        participantReferenceIds?: string[];
        portalKeys?: string[];
    }): Promise<{
        expired: number;
    }>;
    static failIncompleteEmployeeOnboardingForResignation(params: {
        employeeUserId: number;
        actorId?: string | null;
        resignDate?: Date | null;
    }): Promise<{
        failed: number;
    }>;
    static decideOnboarding(requesterUserId: string, request: DecideOnboardingRequest): Promise<DecideOnboardingResponse>;
    static listMyWorkspace(requesterUserId: string): Promise<MyOnboardingWorkspaceResponse>;
    static listAdminMonitoring(requesterUserId: string, options?: OnboardingMonitoringOptions): Promise<AdminOnboardingMonitoringResponse>;
    static listPicMonitoring(requesterUserId: string): Promise<AdminOnboardingMonitoringResponse>;
    static listEmployeePortalMonitoring(requesterUserId: string): Promise<AdminOnboardingMonitoringResponse>;
    static startMaterialRead(requesterUserId: string, request: StartOnboardingMaterialReadRequest): Promise<StartOnboardingMaterialReadResponse>;
    static listEmployeeSummary(requesterUserId: string, request: ListEmployeeOnboardingSummaryRequest): Promise<EmployeeOnboardingSummaryResponse[]>;
    static cancelEmployeeOnboarding(requesterUserId: string, request: CancelEmployeeOnboardingRequest): Promise<CancelEmployeeOnboardingResponse>;
    static startEmployees(requesterUserId: string, request: StartEmployeeOnboardingRequest): Promise<StartEmployeeOnboardingResponse>;
}
export {};
//# sourceMappingURL=onboarding-service.d.ts.map