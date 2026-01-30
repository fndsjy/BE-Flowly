const REVISION_REGEX = /^(.*?)(?:\s*v\s*(\d+(?:\.\d+)*))$/i;

export const normalizeNumber = (value: string) => value.trim();

const hasRevisionSuffix = (value: string) => REVISION_REGEX.test(normalizeNumber(value));

export const getBaseNumber = (value: string): string => {
  const normalized = normalizeNumber(value);
  const match = normalized.match(REVISION_REGEX);
  const base = match?.[1]?.trim();
  return base && base.length > 0 ? base : normalized;
};

export const isRevisionNumber = (candidate: string, original: string) => {
  const normalizedCandidate = normalizeNumber(candidate);
  const normalizedOriginal = normalizeNumber(original);
  const baseOriginal = getBaseNumber(normalizedOriginal);
  const baseCandidate = getBaseNumber(normalizedCandidate);
  return (
    baseOriginal === baseCandidate &&
    hasRevisionSuffix(normalizedCandidate) &&
    normalizedCandidate !== normalizedOriginal
  );
};

export const buildRevisionWhere = (
  field: string,
  baseNumber: string
): Record<string, any> => {
  const base = normalizeNumber(baseNumber);
  return {
    OR: [
      { [field]: base },
      { [field]: { startsWith: `${base} v` } },
      { [field]: { startsWith: `${base} V` } },
      { [field]: { startsWith: `${base}v` } },
      { [field]: { startsWith: `${base}V` } },
    ],
  };
};
