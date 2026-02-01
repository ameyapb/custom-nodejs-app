import express from "express";
import { runQuery } from "../db/queryRunner.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await runQuery("SELECT 1");
    res.json({
      status: "ok",
      db: { status: "ok", latencyMs: result.latencyMs },
    });
  } catch (err) {
    logger.error(
      "Database health check failed. [module=routes/serviceHealth, event=db_check_failed]",
      err
    );
    res
      .status(503)
      .json({ status: "error", db: { status: "down", error: err.message } });
  }
});

export default router;
