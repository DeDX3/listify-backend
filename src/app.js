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
app.use(
  cors({
    origin: "*",
  })
);
app.use(limiter);

app.use("/api", apiRouter);

app.listen(process.env.PORT, () =>
  console.log(`Listening on http://localhost:${process.env.PORT}`)
);
