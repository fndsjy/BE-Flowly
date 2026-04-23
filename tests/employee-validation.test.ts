import { describe, expect, test } from "@jest/globals";
import { EmployeeValidation } from "../src/validation/employee-validation";

const validCreatePayload = {
  BadgeNum: "EMP001",
  Name: "Karyawan Baru",
  Gender: "Male",
  BirthDay: "1995-01-10",
  HireDay: "2026-04-10",
  Street: "Jl. Contoh No. 1",
  Religion: "Islam",
  Tipe: "Tetap",
  isLokasi: "Jakarta",
  Phone: "081234567890",
  DeptId: 1,
  CardNo: "EMP001",
  Shift: null,
  isMem: false,
  isMemDate: null,
  Nik: "3173000000000001",
  ResignDate: null,
  statusLMS: "0",
  city: "Jakarta",
  state: "Indonesia",
  email: "employee@example.com",
  IPMsnFinger: "192.168.0.10",
  BPJSKshtn: null,
  BPJSKtngkerjaan: null,
};

describe("EmployeeValidation nullable dates", () => {
  test("CREATE keeps null resign date as null", () => {
    const parsed = EmployeeValidation.CREATE.parse(validCreatePayload) as {
      ResignDate?: Date | null;
    };

    expect(parsed.ResignDate).toBeNull();
  });

  test("CREATE keeps null isMemDate as null when isMem is false", () => {
    const parsed = EmployeeValidation.CREATE.parse(validCreatePayload) as {
      isMemDate?: Date | null;
    };

    expect(parsed.isMemDate).toBeNull();
  });

  test("UPDATE keeps empty resign date as null", () => {
    const parsed = EmployeeValidation.UPDATE.parse({
      ...validCreatePayload,
      userId: 99,
      ResignDate: "",
    }) as { ResignDate?: Date | null };

    expect(parsed.ResignDate).toBeNull();
  });

  test("CREATE rejects future birth date", () => {
    expect(() =>
      EmployeeValidation.CREATE.parse({
        ...validCreatePayload,
        BirthDay: "2999-01-01",
      })
    ).toThrow("Tanggal lahir tidak boleh melebihi hari ini");
  });
});
