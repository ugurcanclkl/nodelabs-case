import { Router } from "express";
import { redis } from "../utils/redis";
import { authGuard } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/online:
 *   get:
 *     summary: List IDs of currently online users
 *     tags: [Presence]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of user-IDs in Redis set **onlineUsers**
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 online:
 *                   type: array
 *                   items: { type: string }
 *                   example: ["64f0...", "64f1..."]
 *       401:
 *         description: Not authenticated
 */
router.get("/online", authGuard, async (_req, res) => {
  const ids = await redis.smembers("onlineUsers");
  res.json({ online: ids });
});

export default router;
