export interface EmployeeResponse {
  UserId: number;
  Name: string;
  jobDesc: string | null;
}

export interface UpdateEmployeeJobDescRequest {
  userId: number;
  jobDesc: string | null;
}

export const toEmployeeResponse = (data: any): EmployeeResponse => {
  return {
    UserId: data.UserId,
    Name: data.Name,
    jobDesc: data.jobDesc ?? null,
  };
};
