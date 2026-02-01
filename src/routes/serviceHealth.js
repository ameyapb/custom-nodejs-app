import express from "express";
import { runQuery } from "../db/queryRunner.js";
import logger from "../utils/system/logger.js";
import { checkComfyUI } from "../services/comfyUiService.js";

const router = express.Router();

/**
 * @swagger
 * /serviceHealth:
 *   get:
 *     tags:
 *       - Health
 *     summary: Service health check
 *     description: Checks database connectivity and ComfyUI reachability, reporting latency for each
 *     security: []
 *     responses:
 *       200:
 *         description: All services are operational
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
 *                 comfyUi:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ok"
 *                     latencyMs:
 *                       type: integer
 *                       example: 42
 *       503:
 *         description: One or more services are down
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
 *                 comfyUi:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "down"
 *                     error:
 *                       type: string
 */
router.get("/", async (req, res) => {
  const [dbResult, comfyResult] = await Promise.allSettled([
    runQuery("SELECT 1"),
    checkComfyUI(),
  ]);

  const db =
    dbResult.status === "fulfilled"
      ? { status: "ok", latencyMs: dbResult.value.latencyMs }
      : { status: "down", error: dbResult.reason?.message ?? "unknown error" };

  // comfyResult always fulfills — checkComfyUI catches internally
  const comfyUi = comfyResult.value;

  if (db.status === "down") {
    logger.error(
      "Database health check failed. [module=routes/serviceHealth, event=db_check_failed]",
      dbResult.reason
    );
  }
  if (comfyUi.status === "down") {
    logger.error(
      `ComfyUI health check failed: ${comfyUi.error} [module=routes/serviceHealth, event=comfy_check_failed]`
    );
  }

  const allOk = db.status === "ok" && comfyUi.status === "ok";

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "error",
    db,
    comfyUi,
  });
});

export default router;
