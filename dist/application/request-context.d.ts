import { AsyncLocalStorage } from "node:async_hooks";
export type RequestContext = {
    id: string;
    startTime: number;
    firstPrismaAt?: number;
};
export declare const requestContext: AsyncLocalStorage<RequestContext>;
export declare const markFirstPrismaAt: () => RequestContext | undefined;
export declare const getRequestTag: () => string;
//# sourceMappingURL=request-context.d.ts.map