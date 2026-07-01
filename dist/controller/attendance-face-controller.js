import { AttendanceFaceService } from "../service/attendance-face-service.js";
export class AttendanceFaceController {
    static async listEmployees(req, res, next) {
        try {
            const response = await AttendanceFaceService.listEmployees();
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async enroll(req, res, next) {
        try {
            const response = await AttendanceFaceService.enroll(req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteProfile(req, res, next) {
        try {
            const response = await AttendanceFaceService.deleteProfile(req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async matchProfile(req, res, next) {
        try {
            const response = await AttendanceFaceService.matchProfile(req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordSuccess(req, res, next) {
        try {
            const response = await AttendanceFaceService.recordSuccess(req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordFailure(req, res, next) {
        try {
            const response = await AttendanceFaceService.recordFailure(req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listLogs(req, res, next) {
        try {
            const requestedLimit = Number(req.query.limit);
            const response = await AttendanceFaceService.listLogs(Number.isFinite(requestedLimit) ? requestedLimit : 80);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=attendance-face-controller.js.map