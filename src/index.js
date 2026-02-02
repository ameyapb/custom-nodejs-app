import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import healthRouter from "./routes/health.js";
import serviceHealthRouter from "./routes/serviceHealth.js";
import authenticationRouter from "./routes/authenticationRoutes.js";
import protectedResourceRouter from "./routes/resourceRoutes.js";
import comfyRouter from "./routes/comfyRoutes.js";
import logger from "./utils/system/logger.js";
import { runMigrations } from "./db/migrations.js";
import {
  apiRateLimiter,
  comfyGenerateRateLimiter,
} from "./middleware/rateLimitMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";
    logger[logLevel](
      `${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms. [module=index, event=api_call]`
    );
  });

  next();
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health routes
app.use("/health", healthRouter);
app.use("/serviceHealth", serviceHealthRouter);

// API routes
app.use("/api/auth", authenticationRouter);
app.use("/api/comfy", comfyGenerateRateLimiter, comfyRouter);
app.use("/api/resources", apiRateLimiter, protectedResourceRouter);

// Serve static files from React build (public directory)
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// SPA fallback: send index.html for any non-API route
// Must be last - catches all routes not handled above
app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await runMigrations();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(
        `Server started → listening on all interfaces! http://0.0.0.0:${PORT}`
      );
      logger.info(`You can reach the app locally: http://localhost:${PORT}`);
      logger.info(
        `Swagger docs available at: http://localhost:${PORT}/api-docs`
      );
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
