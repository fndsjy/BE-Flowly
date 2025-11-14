import { ZodError } from "zod";
import { ResponseError } from "../error/response-error.js";
export const errorMiddleware = async (error, req, res, next) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            error: `Validation Error : ${JSON.stringify(error)}`,
            issues: error.issues,
        });
    }
    else if (error instanceof ResponseError) {
        res.status(error.status).json({
            errors: error.message
        });
    }
    else {
        console.error(error);
        res.status(500).json({
            error: error.message || "Internal Server Error"
        });
    }
};
//# sourceMappingURL=error-middleware.js.map