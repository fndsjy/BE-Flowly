export const toEmployeeResponse = (data) => {
    return {
        UserId: data.UserId,
        Name: data.Name,
        jobDesc: data.jobDesc ?? null,
    };
};
//# sourceMappingURL=employee-model.js.map