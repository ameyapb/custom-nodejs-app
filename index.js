import express from "express";
import healthRouter from "./routes/health.js";
import serviceHealthRouter from "./routes/serviceHealth.js";
import logger from "./utils/logger.js";

const app = express();
app.use(express.json());

app.use("/health", healthRouter);
app.use("/serviceHealth", serviceHealthRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(
    `Server started. [module=index, event=server_start, url=http://localhost:${PORT}, port=${PORT}]`
  );
});
