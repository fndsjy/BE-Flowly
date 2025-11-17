import express from "express";
import { ApplicationController } from "../controller/app-controller.js";
import { UserController } from "../controller/user-controller.js";
export const publicRouter = express.Router();
publicRouter.get("/", ApplicationController.handleGetRoot);
const v1 = express.Router();
v1.post("/login", UserController.login);
v1.post("/api/users", UserController.register);
v1.get("/profile", UserController.getProfile);
v1.get("/users", UserController.listUsers);
v1.put("/password", UserController.changePassword);
v1.patch("/role", UserController.changeRole);
// Mount /v1
publicRouter.use("/v1", v1);
//# sourceMappingURL=public-api.js.map