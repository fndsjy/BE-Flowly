export const toEmployeeResponse = (data) => {
    return {
        UserId: data.UserId,
        Name: data.Name,
        jobDesc: data.jobDesc ?? null,
        DeptId: data.DeptId ?? null,
        DeptName: data.DeptName ?? null,
    };
};
//# sourceMappingURL=employee-model.js.map