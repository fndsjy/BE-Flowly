import { describe, expect, test } from "@jest/globals";
import { UserValidation } from "../src/validation/user-validation";

describe("UserValidation birthDay constraint", () => {
  test("UPDATE_PROFILE rejects future birth date", () => {
    expect(() =>
      UserValidation.UPDATE_PROFILE.parse({
        birthDay: "2999-01-01",
      })
    ).toThrow("Tanggal lahir tidak boleh melebihi hari ini");
  });
});
