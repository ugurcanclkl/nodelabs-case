import { Router } from "express";
import { authGuard }   from "../middleware/auth";
import {
  validateBody,
  validateQuery,
  validateParams
} from "../utils/validator";

import {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema
} from "../schemas/chat.schema";
import * as ctrl from "../controllers/chat.controller";

const router = Router();

/* ---------------------------------------------------------------------------
 * Conversations
 * -------------------------------------------------------------------------*/

/**
 * @openapi
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation (private or group)
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationDto'
 *     responses:
 *       201:
 *         description: Conversation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/conversations",
  authGuard,
  validateBody(createConversationSchema),
  ctrl.createConversation
);

/**
 * @openapi
 * /api/conversations:
 *   get:
 *     summary: List conversations the current user participates in
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of conversations ordered by recent activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Not authenticated
 */
router.get("/conversations", authGuard, ctrl.listConversations);

/* ---------------------------------------------------------------------------
 * Messages
 * -------------------------------------------------------------------------*/

/**
 * @openapi
 * /api/messages:
 *   post:
 *     summary: Send a message to a conversation
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageDto'
 *     responses:
 *       201:
 *         description: Message persisted and broadcast
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       403:
 *         description: User not in conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/messages",
  authGuard,
  validateBody(sendMessageSchema),
  ctrl.sendMessage
);

/**
 * @openapi
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages for a conversation (paged, oldest-first)
 *     tags: [Chat]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: after
 *         in: query
 *         description: Return messages with _id > after (cursor)
 *         schema: { type: string }
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Messages page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesPage'
 *       401:
 *         description: Not authenticated
 */
router.get(
  "/messages/:conversationId",
  authGuard,
  validateParams(getMessagesSchema.shape.params),
  validateQuery(getMessagesSchema.shape.query),
  ctrl.getMessages
);

export default router;
