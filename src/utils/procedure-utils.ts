export const normalizeNumber = (value: string) => value.trim();

export const getBaseNumber = (value: string): string => {
  const normalized = normalizeNumber(value);
  const match = normalized.match(/^(.*?)(?:\/(\d+))$/);
  return match ? (match[1] ?? normalized) : normalized;
};

export const isRevisionNumber = (candidate: string, original: string) => {
  const baseOriginal = getBaseNumber(original);
  const baseCandidate = getBaseNumber(candidate);
  return baseOriginal === baseCandidate && candidate !== baseOriginal && candidate !== original;
};

export const buildRevisionWhere = (
  field: string,
  baseNumber: string
): Record<string, any> => ({
  OR: [
    { [field]: baseNumber },
    { [field]: { startsWith: `${baseNumber}/` } }
  ]
});
