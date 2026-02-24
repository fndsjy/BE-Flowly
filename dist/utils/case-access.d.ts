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
//# sourceMappingURL=case-access.d.ts.map