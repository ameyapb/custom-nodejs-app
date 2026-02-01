import dotenv from "dotenv";
import { mandatoryEnvVars } from "../utils/system/environmentVars.js";

dotenv.config();

mandatoryEnvVars(["DB_URL"]);

export const config = {
  port: process.env.PORT || 3000,
  logLevel: (process.env.LOG_LEVEL || "info").toLowerCase(),
  logFormat: process.env.LOG_FORMAT || "pretty",
  dbUrl: process.env.DB_URL,
  nodeEnv: process.env.NODE_ENV || "development",
};
