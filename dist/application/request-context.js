import { AsyncLocalStorage } from "node:async_hooks";
export const requestContext = new AsyncLocalStorage();
export const markFirstPrismaAt = () => {
    const ctx = requestContext.getStore();
    if (!ctx) {
        return undefined;
    }
    if (ctx.firstPrismaAt === undefined) {
        ctx.firstPrismaAt = Date.now();
    }
    return ctx;
};
export const getRequestTag = () => {
    const ctx = requestContext.getStore();
    if (!ctx) {
        return "";
    }
    const ageMs = Date.now() - ctx.startTime;
    return ` req=${ctx.id} t=${ageMs}ms`;
};
//# sourceMappingURL=request-context.js.map