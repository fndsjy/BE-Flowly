type WhapiResponse = {
    code?: number;
    status?: string;
    results?: {
        convert?: string;
    };
    [key: string]: unknown;
};
export declare const convertWhapiNumber: (phone: string) => Promise<{
    ok: boolean;
    error: WhapiResponse;
    number?: never;
} | {
    ok: boolean;
    number: string;
    error?: never;
}>;
export declare const sendWhapiMessage: (phone: string, message: string) => Promise<{
    ok: boolean;
    error: {
        message: string;
    };
    data?: never;
} | {
    ok: boolean;
    data: WhapiResponse;
    error?: never;
}>;
export {};
//# sourceMappingURL=whapi-service.d.ts.map