import express from "express";
import { authenticateRequestViaJsonWebToken } from "../middleware/authenticationMiddleware.js";
import { requireRolePermissionForAction } from "../middleware/authorizationMiddleware.js";
import {
  uploadImageMiddleware,
  handleMulterErrors,
} from "../middleware/uploadMiddleware.js";
import { DEFINED_RESOURCE_ACTIONS } from "../config/rolesAndPermissionsConfig.js";
import {
  handleCreateResourceRequest,
  handleReadResourceRequest,
  handleUpdateResourceRequest,
  handleDeleteResourceRequest,
} from "../controllers/resourceController.js";

const protectedResourceRouter = express.Router();

/**
 * @swagger
 * /api/resources:
 *   post:
 *     tags:
 *       - Resources
 *     summary: Create a new image resource
 *     description: Uploads an image file. Requires CREATE permission (admin, editor)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP). Max 10MB
 *     responses:
 *       201:
 *         description: Image resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resource:
 *                   $ref: "#/components/schemas/Resource"
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         description: Unauthorized or missing token
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
protectedResourceRouter.post(
  "/",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_CREATE),
  uploadImageMiddleware.single("image"),
  handleMulterErrors,
  handleCreateResourceRequest
);

/**
 * @swagger
 * /api/resources/{resourceId}:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Retrieve an image resource
 *     description: Downloads or views an image. Requires READ permission
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/jpeg: {}
 *           image/png: {}
 *           image/gif: {}
 *           image/webp: {}
 *       401:
 *         description: Unauthorized or missing token
 *       403:
 *         description: Insufficient permissions or not resource owner
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
protectedResourceRouter.get(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_READ),
  handleReadResourceRequest
);

/**
 * @swagger
 * /api/resources/{resourceId}:
 *   put:
 *     tags:
 *       - Resources
 *     summary: Update a resource (not yet implemented)
 *     description: Future endpoint for resource updates. Requires UPDATE permission
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       501:
 *         description: Not implemented
 */
protectedResourceRouter.put(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_UPDATE),
  uploadImageMiddleware.single("image"),
  handleMulterErrors,
  handleUpdateResourceRequest
);

/**
 * @swagger
 * /api/resources/{resourceId}:
 *   delete:
 *     tags:
 *       - Resources
 *     summary: Delete an image resource
 *     description: Removes an image and its metadata. Requires DELETE permission
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       401:
 *         description: Unauthorized or missing token
 *       403:
 *         description: Insufficient permissions or not resource owner
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
protectedResourceRouter.delete(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_DELETE),
  handleDeleteResourceRequest
);

export default protectedResourceRouter;
