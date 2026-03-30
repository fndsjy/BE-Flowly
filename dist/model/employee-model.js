const normalizeEmployeeEmail = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    const trimmed = value.trim();
    return trimmed && trimmed !== "-" ? trimmed : null;
};
const toStatusLmsResponse = (value) => {
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : "0";
    }
    if (typeof value === "boolean") {
        return value ? "1" : "0";
    }
    return "0";
};
export const toEmployeeResponse = (data) => {
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
export const toEmployeeDepartmentResponse = (department) => {
    return {
        DEPTID: department.DEPTID,
        DEPTNAME: department.DEPTNAME ?? null,
    };
};
//# sourceMappingURL=employee-model.js.map