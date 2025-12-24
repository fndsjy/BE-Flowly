import { z, ZodType } from "zod";
export class EmployeeValidation {
    static UPDATE_JOB_DESC = z.object({
        userId: z.number().int().positive(),
        jobDesc: z.string().max(500).nullable(),
    });
}
//# sourceMappingURL=employee-validation.js.map