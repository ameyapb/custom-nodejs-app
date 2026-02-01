import dotenv from "dotenv";
import winston from "winston";
dotenv.config();

const level = (process.env.LOG_LEVEL || "info").toLowerCase();
const jsonOutput = (process.env.LOG_FORMAT || "pretty") === "json";

const formats = [
  winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  winston.format.errors({ stack: true }),
];

if (jsonOutput) {
  formats.push(winston.format.json());
} else {
  formats.push(
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      const msg = stack || message;
      return `[${timestamp}] [${level}] ${msg}${metaStr}`;
    })
  );
}

const logger = winston.createLogger({
  level,
  format: winston.format.combine(...formats),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
  exitOnError: false,
});

export default logger;
