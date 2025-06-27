import express from "express";
import dotenv from "dotenv";
import apiRouter from "./routes/apiRouter.js";
import { connectDB, validateEnv } from "./config/index.js";
import { limiter } from "./middleware/rateLimiter.js";
import cors from "cors";

const PORT = process.env.PORT || 3000;

const app = express();

dotenv.config();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://listify-iota.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      console.log("CORS request from origin:", origin);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS error: Origin not allowed",
      origin: req.headers.origin,
    });
  }
  next(err);
});

app.use(limiter);

// health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);

  try {
    validateEnv();
    connectDB();
    console.log("Environment validated and database connected");
  } catch (error) {
    console.error("Error during startup:", error);
  }
});
