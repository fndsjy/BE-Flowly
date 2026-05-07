export type CustomerSsoLoginResponse = {
    custid: string;
    token: string;
    expiresIn: number;
    data: CustomerDomasData[];
};
export type CustomerSsoProfileResponse = {
    userId: string;
    username: string;
    name: string;
    cardNumber: string;
    department: string | null;
    roleId: "CUSTOMER";
    roleName: "Customer";
    roleLevel: number;
    custid: string;
    customer: CustomerDomasData | null;
    customerData: CustomerDomasData[];
};
type CustomerDomasData = Record<string, unknown>;
export declare class CustomerSsoService {
    static login(token: unknown): Promise<CustomerSsoLoginResponse>;
    static getProfile(token: unknown): CustomerSsoProfileResponse;
    static logout(token: unknown): void;
}
export {};
//# sourceMappingURL=customer-sso-service.d.ts.map