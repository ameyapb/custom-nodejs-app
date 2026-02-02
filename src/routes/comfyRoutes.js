import express from "express";
import { authenticateRequestViaJsonWebToken } from "../middleware/authenticationMiddleware.js";
import { requireRolePermissionForAction } from "../middleware/authorizationMiddleware.js";
import {
  uploadImageMiddleware,
  handleMulterErrors,
} from "../middleware/uploadMiddleware.js";
import { DEFINED_RESOURCE_ACTIONS } from "../config/rolesAndPermissionsConfig.js";
import { handleGenerateFromPrompt } from "../controllers/comfyController.js";

const comfyRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Comfy
 *     description: Endpoints for image generation using ComfyUI
 */

/**
 * @swagger
 * /api/comfy/generate:
 *   post:
 *     tags:
 *       - Comfy
 *     summary: Generate an image from a text prompt with optional reference image
 *     description: |
 *       Generates an image using a positive prompt (required) and an optional negative prompt.
 *
 *       **Reference Image Options:**
 *       - Upload a new image file as `referenceImage` (multipart/form-data)
 *       - OR provide `referenceImageResourceId` (JSON) to use an existing resource
 *
 *       If a reference image is provided, the face swap workflow is used.
 *       Otherwise, the simple text-to-image workflow is used.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               positivePrompt:
 *                 type: string
 *                 description: The prompt to generate the image from (required, non-empty)
 *                 example: "A futuristic cityscape at sunset"
 *               negativePrompt:
 *                 type: string
 *                 description: Optional prompt describing what to avoid in the image
 *                 example: "No people, no cars"
 *               referenceImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional reference image file for face swapping (JPEG, PNG, GIF, WebP). Max 10MB
 *               referenceImageResourceId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional ID of existing resource to use as reference image (alternative to uploading)
 *             required:
 *               - positivePrompt
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positivePrompt:
 *                 type: string
 *                 description: The prompt to generate the image from (required, non-empty)
 *                 example: "A futuristic cityscape at sunset"
 *               negativePrompt:
 *                 type: string
 *                 description: Optional prompt describing what to avoid in the image
 *                 example: "No people, no cars"
 *               referenceImageResourceId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional ID of existing resource to use as reference image
 *             required:
 *               - positivePrompt
 *     responses:
 *       201:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image generated successfully"
 *                 promptId:
 *                   type: string
 *                   description: ID of the generated prompt
 *                   example: "prompt_12345"
 *                 resource:
 *                   type: object
 *                   description: Metadata about the stored image resource
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "resource_67890"
 *                     filename:
 *                       type: string
 *                       example: "futuristic_city.png"
 *                     url:
 *                       type: string
 *                       example: "https://cdn.example.com/images/futuristic_city.png"
 *       400:
 *         description: Invalid request (missing or invalid positivePrompt, or invalid reference image)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "positivePrompt is required and must be a non-empty string."
 *       401:
 *         description: Unauthorized (JWT missing or invalid)
 *       403:
 *         description: Forbidden (insufficient role permissions or reference image not owned by user)
 *       404:
 *         description: Reference image resource not found
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */

comfyRouter.post(
  "/generate",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_CREATE),
  uploadImageMiddleware.single("referenceImage"),
  handleMulterErrors,
  handleGenerateFromPrompt
);

export default comfyRouter;
