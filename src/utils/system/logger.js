import winston from "winston";
import { config } from "../../config/environment.js";
import util from "util";

const jsonOutput = config.logFormat === "json";

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
      // Use util.inspect instead of JSON.stringify to safely handle circular references
      const metaStr = Object.keys(meta).length
        ? ` ${util.inspect(meta, { depth: null })}`
        : "";
      const msg = stack || message;
      return `[${timestamp}] [${level}] ${msg}${metaStr}`;
    })
  );
}

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(...formats),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
  exitOnError: false,
});

export default logger;
