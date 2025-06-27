import mongoose from "mongoose";

export function connectDB() {
  mongoose.connect(process.env.MONGO_URI);
}

export function validateEnv() {
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "PORT"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "7d",
};
