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

const normalizeEmployeeEmail = (value?: string | null) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed && trimmed !== "-" ? trimmed : null;
};

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

export type CreateEmployeeRequest = RequiredEmployeeMutationFields &
  OptionalEmployeeMutationFields;

export type UpdateEmployeeRequest = RequiredEmployeeMutationFields &
  OptionalEmployeeMutationFields & {
  userId: number;
};

export type DeleteEmployeeRequest = {
  userId: number;
};

export interface UpdateEmployeeJobDescRequest {
  userId: number;
  jobDesc: string | null;
}

const toStatusLmsResponse = (value: EmployeeStatusLmsValue): string => {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : "0";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return "0";
};

export const toEmployeeResponse = (data: EmployeeRecordInput): EmployeeResponse => {
  return {
    UserId: data.UserId,
    BadgeNum: data.BadgeNum,
    Name: data.Name ?? null,
    Gender: data.Gender ?? null,
    BirthDay: data.BirthDay ?? null,
    HireDay: data.HireDay ?? null,
    Street: data.Street ?? null,
    Religion: data.Religion ?? null,
    Tipe: data.Tipe ?? null,
    isLokasi: data.isLokasi ?? null,
    Phone: data.Phone ?? null,
    DeptId: data.DeptId ?? null,
    DeptName: data.DeptName ?? null,
    CardNo: data.CardNo ?? null,
    Shift: data.Shift ?? null,
    isMem: data.isMem ?? null,
    AddBy: data.AddBy ?? null,
    isMemDate: data.isMemDate ?? null,
    isFirstLogin: data.isFirstLogin ?? null,
    ImgName: data.ImgName ?? null,
    SbuSub: data.SbuSub ?? null,
    Nik: data.Nik ?? null,
    ResignDate: data.ResignDate ?? null,
    statusLMS: toStatusLmsResponse(data.statusLMS),
    roleId: data.roleId ?? null,
    jobDesc: data.jobDesc ?? null,
    city: data.city ?? null,
    state: data.state,
    email: normalizeEmployeeEmail(data.email),
    IPMsnFinger: data.IPMsnFinger,
    BPJSKshtn: data.BPJSKshtn ?? null,
    BPJSKtngkerjaan: data.BPJSKtngkerjaan ?? null,
    Created_at: data.Created_at ?? null,
    Lastupdate: data.Lastupdate ?? null,
  };
};

export const toEmployeeDepartmentResponse = (
  department: EmployeeDepartmentResponse
): EmployeeDepartmentResponse => {
  return {
    DEPTID: department.DEPTID,
    DEPTNAME: department.DEPTNAME ?? null,
  };
};
