export const normalizeNumber = (value) => value.trim();
export const getBaseNumber = (value) => {
    const normalized = normalizeNumber(value);
    const match = normalized.match(/^(.*?)(?:\/(\d+))$/);
    return match ? (match[1] ?? normalized) : normalized;
};
export const isRevisionNumber = (candidate, original) => {
    const baseOriginal = getBaseNumber(original);
    const baseCandidate = getBaseNumber(candidate);
    return baseOriginal === baseCandidate && candidate !== baseOriginal && candidate !== original;
};
export const buildRevisionWhere = (field, baseNumber) => ({
    OR: [
        { [field]: baseNumber },
        { [field]: { startsWith: `${baseNumber}/` } }
    ]
});
//# sourceMappingURL=procedure-utils.js.map