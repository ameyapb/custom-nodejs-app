import express from "express";
import healthRouter from "./routes/health.js";
import serviceHealthRouter from "./routes/serviceHealth.js";
import authenticationRouter from "./routes/authenticationRoutes.js";
import protectedResourceRouter from "./routes/resourceRoutes.js";
import logger from "./utils/system/logger.js";

const app = express();
app.use(express.json());

app.use("/health", healthRouter);
app.use("/serviceHealth", serviceHealthRouter);
app.use("/api/auth", authenticationRouter);
app.use("/api/resources", protectedResourceRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(
    `Server started. [module=index, event=server_start, url=http://localhost:${PORT}, port=${PORT}]`
  );
});
