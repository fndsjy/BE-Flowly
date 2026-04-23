import { EmployeeService } from "../service/employee-service.js";
import { FingerMachineService } from "../service/finger-machine-service.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
export class EmployeeController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await EmployeeService.create(payload.userId, req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await EmployeeService.update(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await EmployeeService.remove(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listForPIC(req, res, next) {
        try {
            // // 1. Ambil token dari cookie
            // const token = req.cookies.access_token;
            // if (!token) throw new ResponseError(401, "Unauthorized");
            // // 2. Decode & ambil userId
            // const payload = verifyToken(token);
            // if (!payload) throw new ResponseError(401, "Unauthorized");
            // 3. Panggil service
            const response = await EmployeeService.listForPIC();
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listDepartments(req, res, next) {
        try {
            const response = await EmployeeService.listDepartments();
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listFingerMachines(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await FingerMachineService.list(payload.userId);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateJobDesc(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await EmployeeService.updateJobDesc(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=employee-controller.js.map