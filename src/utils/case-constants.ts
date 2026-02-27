export const CASE_TYPES = ["PROJECT", "PROBLEM"] as const;
export type CaseType = (typeof CASE_TYPES)[number];

export const CASE_VISIBILITIES = ["PRIVATE", "PUBLIC"] as const;
export type CaseVisibility = (typeof CASE_VISIBILITIES)[number];

export const CASE_STATUSES = [
  "NEW",
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "CANCEL",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_DECISION_STATUSES = ["PENDING", "ACCEPT", "REJECT"] as const;
export type CaseDecisionStatus = (typeof CASE_DECISION_STATUSES)[number];

export const CASE_WORK_STATUSES = [
  "NEW",
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "CANCEL",
] as const;
export type CaseWorkStatus = (typeof CASE_WORK_STATUSES)[number];

export const CASE_MEDIA_TYPES = ["PHOTO", "VIDEO"] as const;
export type CaseMediaType = (typeof CASE_MEDIA_TYPES)[number];

export const normalizeUpper = (value: string) => value.trim().toUpperCase();

export const normalizeOptionalUpper = (value?: string | null) => {
  if (value === undefined || value === null) return value;
  return normalizeUpper(value);
};

export const isAllowedValue = (value: string, allowed: readonly string[]) =>
  allowed.includes(value);
