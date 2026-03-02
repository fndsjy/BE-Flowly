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
export declare const getEmployeeChartSbuSubIds: (employeeId: number) => Promise<number[]>;
export declare const ensureCaseNotClosed: (caseId: string) => Promise<{
    isDeleted: boolean;
    caseId: string;
    feedbackApprovedAt: Date | null;
}>;
//# sourceMappingURL=case-access.d.ts.map