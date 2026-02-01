import express from "express";
import { runQuery } from "../db/queryRunner.js";
import logger from "../utils/system/logger.js";

const router = express.Router();

/**
 * @swagger
 * /serviceHealth:
 *   get:
 *     tags:
 *       - Health
 *     summary: Service health check
 *     description: Checks database connectivity and response latency
 *     security: []
 *     responses:
 *       200:
 *         description: Database is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 db:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ok"
 *                     latencyMs:
 *                       type: integer
 *                       example: 5
 *       503:
 *         description: Database is down
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 db:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "down"
 *                     error:
 *                       type: string
 */
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
