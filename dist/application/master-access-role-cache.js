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
const cacheEnabled = isEnabled(process.env.MASTER_ACCESS_ROLE_CACHE_ENABLED, true);
const cacheTtlMs = parsePositiveInteger(process.env.MASTER_ACCESS_ROLE_CACHE_TTL_MS, 60_000);
const cacheServeStale = isEnabled(process.env.MASTER_ACCESS_ROLE_CACHE_STALE_WHILE_REVALIDATE, true);
const cacheMaxStaleMs = parsePositiveInteger(process.env.MASTER_ACCESS_ROLE_CACHE_MAX_STALE_MS, 5 * 60_000);
let cacheGeneration = 0;
const listCache = new Map();
const listRequestCache = new Map();
const portalScopeCache = new Map();
const portalScopeRequestCache = new Map();
const buildListCacheKey = (filters) => {
    const resourceType = filters.resourceType ?? "__ALL__";
    const parentKey = filters.parentKey === undefined
        ? "__UNSET__"
        : filters.parentKey === null
            ? "__NULL__"
            : filters.parentKey;
    const portalKey = filters.portalKey ?? "__ALL__";
    return `${resourceType}|${parentKey}|${portalKey}`;
};
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
const rememberList = (key, value, generation) => {
    if (generation !== cacheGeneration || !cacheEnabled) {
        return value;
    }
    listCache.set(key, {
        value,
        expiresAt: Date.now() + cacheTtlMs,
        staleUntil: Date.now() + cacheTtlMs + cacheMaxStaleMs,
    });
    return value;
};
const rememberPortalScope = (key, value, generation) => {
    if (generation !== cacheGeneration || !cacheEnabled) {
        return value;
    }
    portalScopeCache.set(key, {
        value,
        expiresAt: Date.now() + cacheTtlMs,
        staleUntil: Date.now() + cacheTtlMs + cacheMaxStaleMs,
    });
    return value;
};
export const invalidateMasterAccessRoleCaches = () => {
    cacheGeneration += 1;
    listCache.clear();
    listRequestCache.clear();
    portalScopeCache.clear();
    portalScopeRequestCache.clear();
};
export const withMasterAccessRoleListCache = async (filters, loader) => {
    if (!cacheEnabled) {
        return loader();
    }
    const key = buildListCacheKey(filters);
    const cacheState = getCacheState(listCache.get(key));
    if (cacheState.kind === "fresh") {
        return cacheState.value;
    }
    const createRequest = () => {
        const inFlight = listRequestCache.get(key);
        if (inFlight) {
            return inFlight;
        }
        const requestGeneration = cacheGeneration;
        const request = loader()
            .then((value) => rememberList(key, value, requestGeneration))
            .finally(() => {
            listRequestCache.delete(key);
        });
        listRequestCache.set(key, request);
        return request;
    };
    if (cacheState.kind === "stale") {
        void createRequest().catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn("[MASTER ACCESS ROLE CACHE REFRESH FAILED]", {
                cacheKey: key,
                message,
            });
        });
        return cacheState.value;
    }
    listCache.delete(key);
    return createRequest();
};
export const withMasterAccessRolePortalScopeCache = async (portalKey, loader) => {
    if (!cacheEnabled) {
        return loader();
    }
    const cacheState = getCacheState(portalScopeCache.get(portalKey));
    if (cacheState.kind === "fresh") {
        return cacheState.value;
    }
    const createRequest = () => {
        const inFlight = portalScopeRequestCache.get(portalKey);
        if (inFlight) {
            return inFlight;
        }
        const requestGeneration = cacheGeneration;
        const request = loader()
            .then((value) => rememberPortalScope(portalKey, value, requestGeneration))
            .finally(() => {
            portalScopeRequestCache.delete(portalKey);
        });
        portalScopeRequestCache.set(portalKey, request);
        return request;
    };
    if (cacheState.kind === "stale") {
        void createRequest().catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn("[MASTER ACCESS ROLE PORTAL CACHE REFRESH FAILED]", {
                portalKey,
                message,
            });
        });
        return cacheState.value;
    }
    portalScopeCache.delete(portalKey);
    return createRequest();
};
//# sourceMappingURL=master-access-role-cache.js.map