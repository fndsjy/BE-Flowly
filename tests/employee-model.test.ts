import { describe, expect, test } from "@jest/globals";
import { toEmployeeResponse } from "../src/model/employee-model";

describe("toEmployeeResponse nullable dates", () => {
  test("normalizes epoch resign date to null", () => {
    const response = toEmployeeResponse({
      UserId: 10,
      BadgeNum: "EMP010",
      Name: "Epoch User",
      Gender: "Male",
      BirthDay: new Date("1995-01-10T00:00:00.000Z"),
      HireDay: new Date("2026-04-10T00:00:00.000Z"),
      Street: "Jl. Contoh",
      Religion: "Islam",
      Tipe: "Tetap",
      isLokasi: "Jakarta",
      Phone: "081234567890",
      DeptId: 1,
      DeptName: "HRD",
      CardNo: "EMP010",
      Shift: null,
      isMem: false,
      AddBy: "ADMIN",
      isMemDate: new Date(0),
      isFirstLogin: 0,
      ImgName: "domas.png",
      SbuSub: null,
      Nik: "3173000000000010",
      ResignDate: new Date(0),
      statusLMS: false,
      roleId: null,
      jobDesc: null,
      city: "Jakarta",
      state: "Indonesia",
      email: "epoch@example.com",
      IPMsnFinger: "192.168.0.20",
      BPJSKshtn: null,
      BPJSKtngkerjaan: null,
      Created_at: new Date("2026-04-10T00:00:00.000Z"),
      Lastupdate: new Date("2026-04-10T00:00:00.000Z"),
    });

    expect(response.ResignDate).toBeNull();
    expect(response.isMemDate).toBeNull();
  });
});
