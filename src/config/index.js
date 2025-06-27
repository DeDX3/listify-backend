import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      // Don't throw error, let the app continue running
    });
}

export function validateEnv() {
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
    // Don't throw error, let the app continue running
    return false;
  }

  console.log("Environment variables validated successfully");
  return true;
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "7d",
};
