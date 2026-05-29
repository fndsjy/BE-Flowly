export type SupplierSsoLoginResponse = {
    supplierId: string;
    token: string;
    expiresIn: number;
    data: SupplierDomasData[];
};
export type SupplierSsoProfileResponse = {
    userId: string;
    username: string;
    name: string;
    cardNumber: string;
    department: string | null;
    roleId: "SUPPLIER";
    roleName: "Supplier";
    roleLevel: number;
    supplierId: string;
    supplier: SupplierDomasData | null;
    supplierData: SupplierDomasData[];
};
type SupplierDomasData = Record<string, unknown>;
export declare class SupplierSsoService {
    static login(token: unknown): Promise<SupplierSsoLoginResponse>;
    static getProfile(token: unknown): SupplierSsoProfileResponse;
    static logout(token: unknown): void;
}
export {};
//# sourceMappingURL=supplier-sso-service.d.ts.map