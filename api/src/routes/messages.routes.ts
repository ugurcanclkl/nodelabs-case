import { Router } from "express";
import { es } from "../utils/elastic";
import { authGuard } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/messages/search:
 *   get:
 *     summary: Full-text search in messages
 *     description: |
 *       Performs an Elasticsearch full-text **match** on the `text` field  
 *       and can be narrowed down to a single conversation.
 *     tags: [Messages, Search]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         example: "deployment finished"
 *       - in: query
 *         name: conversationId
 *         schema: { type: string }
 *         example: "64f0cf3bf9..."
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Hits ordered by newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: q missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/messages/search", authGuard, async (req, res) => {
  const { q, conversationId, limit = 25 } = req.query as any;
  if (!q) return res.status(400).json({ error: "missing q" });

  const must: any[] = [{ match: { text: q } }];
  if (conversationId) must.push({ term: { conversationId } });

  const result = await es.search<{
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string;
  }>({
    index: "messages",
    size: Number(limit),
    query: { bool: { must } },
    sort: [{ createdAt: "desc" }],
  });

  res.json(result.hits.hits.map(({ _id, _source }) => ({ id: _id, ..._source! })));
});

export default router;
