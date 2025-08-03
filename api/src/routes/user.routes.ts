import { Router } from "express";
import { authGuard } from "../middleware/auth";
import { validateBody } from "../utils/validator";
import { updateProfileSchema } from "../schemas/user.schema";
import { updateMe } from "../controllers/user.controller";

const router = Router();

/**
 * @openapi
 * /api/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileDto'
 *     responses:
 *       200:
 *         description: Updated user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 */
router.put(
  "/auth/me",
  authGuard,
  validateBody(updateProfileSchema),
  updateMe
);

export default router;
