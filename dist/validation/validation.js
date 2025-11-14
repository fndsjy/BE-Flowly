import { ZodType } from "zod";
export class Validation {
    static validate(schema, data) {
        return schema.parse(data);
    }
}
//# sourceMappingURL=validation.js.map