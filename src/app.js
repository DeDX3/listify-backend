import express from "express";
import dotenv from "dotenv";
import apiRouter from "./routes/apiRouter.js";
import { connectDB, validateEnv } from "./config/index.js";
import { limiter } from "./middleware/rateLimiter.js";
import cors from "cors";

const app = express();

dotenv.config();

validateEnv();

connectDB();

app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://listify-iota.vercel.app/"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
