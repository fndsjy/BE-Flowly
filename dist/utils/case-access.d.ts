export type CaseAccess = {
    actorType: "FLOWLY" | "EMPLOYEE";
    requesterId: string;
    employeeId?: number;
    canRead: boolean;
    canCrud: boolean;
};
export declare const resolveCaseAccess: (requesterId: string) => Promise<CaseAccess>;
export declare const assertCaseRead: (access: CaseAccess) => void;
export declare const assertCaseCrud: (access: CaseAccess) => void;
export declare const isPicForSbuSub: (employeeId: number, sbuSubId: number) => Promise<boolean>;
export declare const isAssigneeForDepartment: (employeeId: number, caseDepartmentId: string) => Promise<boolean>;
export declare const isAssigneeForCase: (employeeId: number, caseId: string) => Promise<boolean>;
export declare const isAssigneeForSbuSub: (employeeId: number, caseId: string, sbuSubId: number) => Promise<boolean>;
export declare const getEmployeeChartSbuSubIds: (employeeId: number) => Promise<number[]>;
export declare const isRequesterForCase: (employeeId: number, caseId: string) => Promise<boolean>;
export declare const isEmployeeInvolvedInCase: (employeeId: number, caseId: string) => Promise<boolean>;
export declare const canEmployeeViewCase: (employeeId: number, caseId: string) => Promise<boolean>;
export declare const canEmployeeViewFishbone: (employeeId: number, caseFishboneId: string) => Promise<boolean>;
export declare const ensureCaseNotClosed: (caseId: string) => Promise<{
    isDeleted: boolean;
    caseId: string;
    feedbackApprovedAt: Date | null;
}>;
//# sourceMappingURL=case-access.d.ts.map