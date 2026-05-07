export type CustomerAuthPayload = {
    type: "customer";
    custid: string;
    sessionId: string;
    iat?: number;
    exp?: number;
};
export declare const generateCustomerToken: (payload: Omit<CustomerAuthPayload, "type">) => string;
export declare const verifyCustomerToken: (token: string) => CustomerAuthPayload;
export declare const getCustomerTokenExpiresInSeconds: (token: string) => number;
//# sourceMappingURL=customer-auth.d.ts.map