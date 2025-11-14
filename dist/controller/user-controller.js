import { UserService } from "../service/user-service.js";
export class UserController {
    static async register(req, res, next) {
        try {
            const request = req.body;
            const response = await UserService.register(request);
            res.status(201).json({
                data: response
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=user-controller.js.map