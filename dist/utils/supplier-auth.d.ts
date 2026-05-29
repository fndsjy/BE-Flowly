export type SupplierAuthPayload = {
    type: "supplier";
    supplierId: string;
    sessionId: string;
    iat?: number;
    exp?: number;
};
export declare const generateSupplierToken: (payload: Omit<SupplierAuthPayload, "type">) => string;
export declare const verifySupplierToken: (token: string) => SupplierAuthPayload;
export declare const getSupplierTokenExpiresInSeconds: (token: string) => number;
//# sourceMappingURL=supplier-auth.d.ts.map