export const CASE_TYPES = ["PROJECT", "PROBLEM"];
export const CASE_STATUSES = [
    "NEW",
    "PENDING",
    "IN_PROGRESS",
    "DONE",
    "CANCEL",
];
export const CASE_DECISION_STATUSES = ["PENDING", "ACCEPT", "REJECT"];
export const CASE_WORK_STATUSES = [
    "NEW",
    "PENDING",
    "IN_PROGRESS",
    "DONE",
    "CANCEL",
];
export const CASE_MEDIA_TYPES = ["PHOTO", "VIDEO"];
export const normalizeUpper = (value) => value.trim().toUpperCase();
export const normalizeOptionalUpper = (value) => {
    if (value === undefined || value === null)
        return value;
    return normalizeUpper(value);
};
export const isAllowedValue = (value, allowed) => allowed.includes(value);
//# sourceMappingURL=case-constants.js.map