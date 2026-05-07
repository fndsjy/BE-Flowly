import { CustomerSsoService } from "../service/customer-sso-service.js";
const CUSTOMER_COOKIE_NAME = "customer_access_token";
const customerCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
};
export class CustomerSsoController {
    static async login(req, res, next) {
        try {
            const response = await CustomerSsoService.login(req.body?.token);
            res.cookie(CUSTOMER_COOKIE_NAME, response.token, {
                ...customerCookieOptions,
                maxAge: response.expiresIn * 1000,
            });
            res.status(200).json({
                response: {
                    custid: response.custid,
                    expiresIn: response.expiresIn,
                    data: response.data,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const response = CustomerSsoService.getProfile(req.cookies?.[CUSTOMER_COOKIE_NAME]);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            CustomerSsoService.logout(req.cookies?.[CUSTOMER_COOKIE_NAME]);
            res.clearCookie(CUSTOMER_COOKIE_NAME, customerCookieOptions);
            res.status(200).json({ message: "Customer logout successful" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=customer-sso-controller.js.map