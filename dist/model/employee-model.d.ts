export interface EmployeeResponse {
    UserId: number;
    Name: string;
    jobDesc: string | null;
}
export interface UpdateEmployeeJobDescRequest {
    userId: number;
    jobDesc: string | null;
}
export declare const toEmployeeResponse: (data: any) => EmployeeResponse;
//# sourceMappingURL=employee-model.d.ts.map