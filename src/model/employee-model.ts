export interface EmployeeResponse {
  UserId: number;
  Name: string;
}

export const toEmployeeResponse = (data: any): EmployeeResponse => {
  return {
    UserId: data.UserId,
    Name: data.Name,
  };
};
