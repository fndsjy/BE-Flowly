export type ProcedureAccess = {
    actorType: "FLOWLY" | "EMPLOYEE";
    roleLevel?: number;
    canCrud: boolean;
};
export declare const getProcedureAccess: (requesterId: string) => Promise<ProcedureAccess>;
export declare const assertProcedureCrud: (access: ProcedureAccess) => void;
//# sourceMappingURL=procedure-access.d.ts.map