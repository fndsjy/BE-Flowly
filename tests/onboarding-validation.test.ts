import { describe, expect, test } from "@jest/globals";
import { OnboardingValidation } from "../src/validation/onboarding-validation";

describe("OnboardingValidation.START_EMPLOYEE", () => {
  test("accepts selected employees marked as previously passed with a note", () => {
    const parsed = OnboardingValidation.START_EMPLOYEE.parse({
      portalKey: "EMPLOYEE",
      userIds: [10, 20],
      previouslyPassedUserIds: [20],
      previouslyPassedNote: "Kelulusan telah dikonfirmasi HRD.",
    }) as {
      userIds: number[];
      previouslyPassedUserIds: number[];
      previouslyPassedNote?: string;
    };

    expect(parsed.userIds).toEqual([10, 20]);
    expect(parsed.previouslyPassedUserIds).toEqual([20]);
    expect(parsed.previouslyPassedNote).toBe(
      "Kelulusan telah dikonfirmasi HRD."
    );
  });

  test("requires a note when an employee is marked as previously passed", () => {
    expect(() =>
      OnboardingValidation.START_EMPLOYEE.parse({
        userIds: [10],
        previouslyPassedUserIds: [10],
      })
    ).toThrow(
      "Keterangan wajib diisi untuk karyawan yang sudah lulus sebelumnya"
    );
  });

  test("rejects previously passed employees outside the selected employees", () => {
    expect(() =>
      OnboardingValidation.START_EMPLOYEE.parse({
        userIds: [10],
        previouslyPassedUserIds: [20],
        previouslyPassedNote: "Sudah diverifikasi.",
      })
    ).toThrow(
      "Karyawan yang sudah lulus sebelumnya harus termasuk dalam pilihan"
    );
  });
});
