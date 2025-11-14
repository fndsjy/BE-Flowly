import express from "express";
import { ApplicationController } from "../controller/app-controller.js";
import { UserController } from "../controller/user-controller.js";

export const publicRouter = express.Router();
publicRouter.get("/", ApplicationController.handleGetRoot);
publicRouter.post("/api/users", UserController.register);