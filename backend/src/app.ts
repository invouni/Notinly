import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRouter.js"
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes)

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NOTION ZERO API is running",
    timestamp: new Date().toISOString(),
  });
});



app.use((_req, res) => {
  res.status(404).json({
    success: true,
    message: "route not found",
  });
});

// Central error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("API Error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;
