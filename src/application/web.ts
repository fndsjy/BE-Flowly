import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "../middleware/reqlog-middleware.js";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";

export const web = express();

const corsOptions = {
  origin: [
    "http://10.0.1.100",
    "http://10.0.1.16:5173",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

web.use(cors(corsOptions));

web.use(requestLogger);
web.use(express.json({ limit: "25mb" }));
web.use(cookieParser()); 
web.use(publicRouter);
web.use(errorMiddleware);
