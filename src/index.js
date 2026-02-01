import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { apiRateLimiter } from "./middleware/rateLimitMiddleware.js";
import healthRouter from "./routes/health.js";
import serviceHealthRouter from "./routes/serviceHealth.js";
import authenticationRouter from "./routes/authenticationRoutes.js";
import protectedResourceRouter from "./routes/resourceRoutes.js";
import logger from "./utils/system/logger.js";
import { runMigrations } from "./db/migrations.js";

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
app.use("/api/resources", apiRateLimiter, protectedResourceRouter);

const PORT = process.env.PORT || 3000;

// Run migrations before starting server
await runMigrations();

app.listen(PORT, () => {
  logger.info(
    `Server started. [module=index, event=server_start, url=http://localhost:${PORT}, port=${PORT}]`
  );
  logger.info(
    `Swagger docs available at http://localhost:${PORT}/api-docs. [module=index, event=swagger_ready]`
  );
});
