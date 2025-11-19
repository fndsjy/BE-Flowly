import express from "express";
import cookieParser from "cookie-parser";
import { requestLogger } from "../middleware/reqlog-middleware.js";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";

export const web = express();

web.use(requestLogger);
web.use(express.json());
web.use(cookieParser()); 
web.use(publicRouter);
web.use(errorMiddleware);