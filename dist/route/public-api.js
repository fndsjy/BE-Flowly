import express from "express";
import { ApplicationController } from "../controller/app-controller.js";
import { UserController } from "../controller/user-controller.js";
import { ChartController } from "../controller/chart-controller.js";
import { PilarController } from "../controller/pilar-controller.js";
import { EmployeeController } from "../controller/employee-controller.js";
import { SbuController } from "../controller/sbu-controller.js";
import { SbuSubController } from "../controller/sbu-sub-controller.js";
import { ChartMemberController } from "../controller/chart-member-controller.js";
export const publicRouter = express.Router();
publicRouter.get("/", ApplicationController.handleGetRoot);
const v1 = express.Router();
v1.post("/register", UserController.register); // 🔐 role 1 only
v1.post("/login", UserController.login);
v1.get("/profile", UserController.getProfile);
v1.get("/users", UserController.listUsers); // 🔐 role 1 only
v1.patch("/password", UserController.changePassword);
v1.patch("/role", UserController.changeRole); // 🔐 role 1 only
v1.get("/roles", UserController.listRoles);
v1.post("/logout", UserController.logout);
v1.get("/employee", EmployeeController.listForPIC);
v1.post("/pilar", PilarController.create);
v1.put("/pilar", PilarController.update);
v1.delete("/pilar", PilarController.softDelete);
v1.get("/pilar", PilarController.list);
v1.post("/sbu", SbuController.create);
v1.put("/sbu", SbuController.update);
v1.delete("/sbu", SbuController.softDelete);
v1.get("/sbu", SbuController.list);
v1.get("/sbu-by-pilar", SbuController.getByPilar);
v1.post("/sbu-sub", SbuSubController.create);
v1.put("/sbu-sub", SbuSubController.update);
v1.delete("/sbu-sub", SbuSubController.softDelete);
v1.get("/sbu-sub", SbuSubController.list);
v1.get("/sbu-sub-by-sbu", SbuSubController.getBySbu);
v1.get("/sbu-sub-by-pilar", SbuSubController.getByPilar);
v1.post("/chart", ChartController.create);
v1.put("/chart", ChartController.update);
v1.delete("/chart", ChartController.softDelete);
v1.get("/chart", ChartController.list);
v1.get("/chart-by-sbuSub", ChartController.listBySbuSub);
// v1.post("/chart-member", ChartMemberController.create);
v1.put("/chart-member", ChartMemberController.update);
v1.delete("/chart-member", ChartMemberController.softDelete);
v1.get("/chart-member", ChartMemberController.list);
// Mount /v1
publicRouter.use("/v1/api", v1);
//# sourceMappingURL=public-api.js.map