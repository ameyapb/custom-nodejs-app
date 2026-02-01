import express from "express";

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Basic health check
 *     description: Returns server uptime and status
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 */

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

export default router;
