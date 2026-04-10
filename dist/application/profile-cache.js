import { logger } from "./logging.js";
const isEnabled = (value, defaultValue = false) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return defaultValue;
    }
    return normalized === "1" || normalized === "true" || normalized === "yes";
};
const parsePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.floor(parsed);
};
const cacheEnabled = isEnabled(process.env.PROFILE_CACHE_ENABLED, true);
const cacheTtlMs = parsePositiveInteger(process.env.PROFILE_CACHE_TTL_MS, 30_000);
const cacheServeStale = isEnabled(process.env.PROFILE_CACHE_STALE_WHILE_REVALIDATE, true);
const cacheMaxStaleMs = parsePositiveInteger(process.env.PROFILE_CACHE_MAX_STALE_MS, 2 * 60_000);
let cacheGeneration = 0;
const profileCache = new Map();
const profileRequestCache = new Map();
const getCacheState = (entry) => {
    if (!entry) {
        return { kind: "miss" };
    }
    const now = Date.now();
    if (entry.expiresAt > now) {
        return {
            kind: "fresh",
            value: entry.value,
        };
    }
    if (cacheServeStale && entry.staleUntil > now) {
        return {
            kind: "stale",
            value: entry.value,
        };
    }
    return { kind: "expired" };
};
const rememberProfile = (userId, value, generation) => {
    if (generation !== cacheGeneration || !cacheEnabled) {
        return value;
    }
    profileCache.set(userId, {
        value,
        expiresAt: Date.now() + cacheTtlMs,
        staleUntil: Date.now() + cacheTtlMs + cacheMaxStaleMs,
    });
    return value;
};
export const invalidateProfileCache = (userId) => {
    cacheGeneration += 1;
    if (userId) {
        profileCache.delete(userId);
        profileRequestCache.delete(userId);
        return;
    }
    profileCache.clear();
    profileRequestCache.clear();
};
export const withProfileCache = async (userId, loader) => {
    if (!cacheEnabled) {
        return loader();
    }
    const cacheState = getCacheState(profileCache.get(userId));
    if (cacheState.kind === "fresh") {
        return cacheState.value;
    }
    const createRequest = () => {
        const inFlight = profileRequestCache.get(userId);
        if (inFlight) {
            return inFlight;
        }
        const requestGeneration = cacheGeneration;
        const request = loader()
            .then((value) => rememberProfile(userId, value, requestGeneration))
            .finally(() => {
            profileRequestCache.delete(userId);
        });
        profileRequestCache.set(userId, request);
        return request;
    };
    if (cacheState.kind === "stale") {
        void createRequest().catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn("[PROFILE CACHE REFRESH FAILED]", {
                userId,
                message,
            });
        });
        return cacheState.value;
    }
    profileCache.delete(userId);
    return createRequest();
};
//# sourceMappingURL=profile-cache.js.map