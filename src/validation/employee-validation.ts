import { z, ZodType } from "zod";

export class EmployeeValidation {
  static readonly UPDATE_JOB_DESC: ZodType = z.object({
    userId: z.number().int().positive(),
    jobDesc: z.string().max(500).nullable(),
  });
}
