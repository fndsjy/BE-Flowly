import express from "express";
import { ApplicationController } from "../controller/app-controller.js";
import { UserController } from "../controller/user-controller.js";
import { OrgChartController } from "../controller/orgchart-controller.js";
import { PilarController } from "../controller/pilar-controller.js";

export const publicRouter = express.Router();
publicRouter.get("/", ApplicationController.handleGetRoot);

const v1 = express.Router();
v1.post("/register", UserController.register);          // 🔐 role 1 only
v1.post("/login", UserController.login);
v1.get("/profile", UserController.getProfile);
v1.get("/users", UserController.listUsers);             // 🔐 role 1 only
v1.patch("/password", UserController.changePassword);
v1.patch("/role", UserController.changeRole);           // 🔐 role 1 only
v1.get("/roles", UserController.listRoles);
v1.post("/logout", UserController.logout);

v1.post("/pilar", PilarController.create);
v1.put("/pilar", PilarController.update);
v1.delete("/pilar", PilarController.softDelete);
v1.get("/pilar", PilarController.list);

v1.post("/orgchart", OrgChartController.create);
v1.put("/orgchart", OrgChartController.update);
v1.delete("/orgchart", OrgChartController.softDelete);
v1.get("/orgchart", OrgChartController.list);
v1.get("/orgchart-by-structure", OrgChartController.listStructure);

// Mount /v1
publicRouter.use("/v1/api", v1);