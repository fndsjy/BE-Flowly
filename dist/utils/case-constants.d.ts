export declare const CASE_TYPES: readonly ["PROJECT", "PROBLEM"];
export type CaseType = (typeof CASE_TYPES)[number];
export declare const CASE_STATUSES: readonly ["NEW", "PENDING", "IN_PROGRESS", "DONE", "CANCEL"];
export type CaseStatus = (typeof CASE_STATUSES)[number];
export declare const CASE_DECISION_STATUSES: readonly ["PENDING", "ACCEPT", "REJECT"];
export type CaseDecisionStatus = (typeof CASE_DECISION_STATUSES)[number];
export declare const CASE_WORK_STATUSES: readonly ["NEW", "PENDING", "IN_PROGRESS", "DONE", "CANCEL"];
export type CaseWorkStatus = (typeof CASE_WORK_STATUSES)[number];
export declare const CASE_MEDIA_TYPES: readonly ["PHOTO", "VIDEO"];
export type CaseMediaType = (typeof CASE_MEDIA_TYPES)[number];
export declare const normalizeUpper: (value: string) => string;
export declare const normalizeOptionalUpper: (value?: string | null) => string | null | undefined;
export declare const isAllowedValue: (value: string, allowed: readonly string[]) => boolean;
//# sourceMappingURL=case-constants.d.ts.map