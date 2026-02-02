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
 *     summary: Generate an image using ComfyUI
 *     description: |
 *       Generate an AI image from a text prompt using ComfyUI. Supports both simple text-to-image
 *       and face swap workflows.
 *
 *       ## Workflows
 *       - **Simple Generation**: Provide only prompts (no reference image)
 *       - **Face Swap**: Include a reference image to swap faces in the generated image
 *
 *       ## Reference Image Options
 *       You can provide a reference image in two ways:
 *       1. **Upload New**: Include `referenceImage` file in multipart/form-data
 *       2. **Use Existing**: Provide `referenceImageResourceId` of a previously uploaded resource
 *
 *       ## Rate Limiting
 *       Limited to 5 generations per 10 minutes per IP address.
 *
 *       ## Authentication
 *       Requires JWT bearer token with CREATE permission (admin or editor role).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - positivePrompt
 *             properties:
 *               positivePrompt:
 *                 type: string
 *                 description: What you want to see in the generated image
 *                 example: "A majestic mountain landscape at sunset, photorealistic"
 *                 minLength: 1
 *               negativePrompt:
 *                 type: string
 *                 description: What you want to avoid in the generated image
 *                 example: "blurry, low quality, distorted, ugly"
 *               referenceImage:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Reference image for face swapping (optional).
 *                   Accepted formats: JPEG, PNG, GIF, WebP. Max size: 10MB
 *               referenceImageResourceId:
 *                 type: string
 *                 format: uuid
 *                 description: |
 *                   ID of an existing resource to use as reference image (optional).
 *                   Alternative to uploading a new file. Cannot be used with referenceImage.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *           examples:
 *             simpleGeneration:
 *               summary: Simple text-to-image
 *               value:
 *                 positivePrompt: "A serene lake with mountains in the background"
 *                 negativePrompt: "people, buildings, cars"
 *             faceSwapWithUpload:
 *               summary: Face swap with new upload
 *               value:
 *                 positivePrompt: "Professional headshot, business attire"
 *                 negativePrompt: "blurry, low quality"
 *                 referenceImage: "(binary file)"
 *             faceSwapWithExisting:
 *               summary: Face swap with existing resource
 *               value:
 *                 positivePrompt: "Astronaut in space suit"
 *                 negativePrompt: "distorted face"
 *                 referenceImageResourceId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - promptId
 *                 - resource
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image generated successfully"
 *                 promptId:
 *                   type: string
 *                   description: ComfyUI prompt ID for this generation
 *                   example: "abc123-def456-ghi789"
 *                 resource:
 *                   $ref: "#/components/schemas/Resource"
 *       400:
 *         description: Bad request - invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "positivePrompt is required and must be a non-empty string."
 *                     - "No image file provided"
 *                     - "Invalid file type: image/svg+xml"
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: Forbidden - insufficient permissions or unauthorized access to reference image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Role 'viewer' does not have permission to perform 'create'"
 *                     - "Failed to retrieve reference image: Unauthorized to access this resource"
 *       404:
 *         description: Reference image resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve reference image: Resource not found"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Too many generation requests. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
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
