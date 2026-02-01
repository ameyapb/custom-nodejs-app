import dotenv from "dotenv";
import { mandatoryEnvVars } from "../utils/system/environmentVars.js";

dotenv.config();

mandatoryEnvVars(["DB_URL", "JWT_SECRET", "COMFYUI_URL"]);

export const config = {
  port: process.env.PORT || 3000,
  logLevel: (process.env.LOG_LEVEL || "info").toLowerCase(),
  logFormat: process.env.LOG_FORMAT || "pretty",
  dbUrl: process.env.DB_URL,
  dbSchema: process.env.DB_SCHEMA || "public",
  nodeEnv: process.env.NODE_ENV || "development",
  dbPoolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
  dbPoolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
  jwtSecret: process.env.JWT_SECRET,
  comfyUiUrl: process.env.COMFYUI_URL || null,
  comfyUiApiKey: process.env.COMFYUI_API_KEY || null,
};
