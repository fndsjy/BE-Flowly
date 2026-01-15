import { ResponseError } from "../error/response-error.js";
import { verifyToken } from "../utils/auth.js";
import { ChartMemberService } from "../service/chart-member-service.js";
export class ChartMemberController {
    // static async create(req: Request, res: Response, next: NextFunction) {
    //   try {
    //     const token = req.cookies.access_token;
    //     if (!token) throw new ResponseError(401, "Unauthorized");
    //     const payload = verifyToken(token);
    //     const response = await ChartMemberService.create(payload.userId, req.body);
    //     res.status(201).json({ response });
    //   } catch (err) {
    //     next(err);
    //   }
    // }
    static async update(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await ChartMemberService.update(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async softDelete(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            await ChartMemberService.softDelete(payload.userId, req.body);
            res.status(200).json({ message: "Member deleted" });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const { chartId } = req.query;
            if (!chartId)
                return res.status(400).json({ error: "chartId is required" });
            const response = await ChartMemberService.listByChart(payload.userId, String(chartId));
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=chart-member-controller.js.map