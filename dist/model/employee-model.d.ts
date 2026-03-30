export interface EmployeeResponse {
    UserId: number;
    BadgeNum: string;
    Name: string | null;
    Gender: string | null;
    BirthDay: Date | null;
    HireDay: Date | null;
    Street: string | null;
    Religion: string | null;
    Tipe: string | null;
    isLokasi: string | null;
    Phone: string | null;
    DeptId: number | null;
    DeptName: string | null;
    CardNo: string | null;
    Shift: number | null;
    isMem: boolean | null;
    AddBy: string | null;
    isMemDate: Date | null;
    isFirstLogin: number | null;
    ImgName: string | null;
    SbuSub: number | null;
    Nik: string | null;
    ResignDate: Date | null;
    statusLMS: string;
    roleId: number | null;
    jobDesc: string | null;
    city: string | null;
    state: string;
    email: string | null;
    IPMsnFinger: string;
    BPJSKshtn: string | null;
    BPJSKtngkerjaan: string | null;
    Created_at: Date | null;
    Lastupdate: Date | null;
}
export interface EmployeeDepartmentResponse {
    DEPTID: number;
    DEPTNAME: string | null;
}
type EmployeeStatusLmsValue = boolean | string | null | undefined;
export type EmployeeRecordInput = Omit<EmployeeResponse, "DeptName" | "statusLMS"> & {
    DeptName?: string | null;
    statusLMS?: EmployeeStatusLmsValue;
};
type RequiredEmployeeMutationFields = {
    BadgeNum: string;
    Name: string;
    Gender: string;
    BirthDay: Date | string;
    HireDay: Date | string;
    Street: string;
    Religion: string;
    Tipe: string;
    isLokasi: string;
    Phone: string;
    DeptId: number;
    CardNo: string;
    Nik: string;
    city: string;
    state: string;
    email: string;
    IPMsnFinger: string;
};
type OptionalEmployeeMutationFields = {
    Shift?: number | null;
    isMem?: boolean | null;
    isMemDate?: Date | string | null;
    SbuSub?: number | null;
    ResignDate?: Date | string | null;
    statusLMS?: string;
    roleId?: number | null;
    jobDesc?: string | null;
    BPJSKshtn?: string | null;
    BPJSKtngkerjaan?: string | null;
};
export type CreateEmployeeRequest = RequiredEmployeeMutationFields & OptionalEmployeeMutationFields;
export type UpdateEmployeeRequest = RequiredEmployeeMutationFields & OptionalEmployeeMutationFields & {
    userId: number;
};
export type DeleteEmployeeRequest = {
    userId: number;
};
export interface UpdateEmployeeJobDescRequest {
    userId: number;
    jobDesc: string | null;
}
export declare const toEmployeeResponse: (data: EmployeeRecordInput) => EmployeeResponse;
export declare const toEmployeeDepartmentResponse: (department: EmployeeDepartmentResponse) => EmployeeDepartmentResponse;
export {};
//# sourceMappingURL=employee-model.d.ts.map