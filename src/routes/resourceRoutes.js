import express from "express";
import { authenticateRequestViaJsonWebToken } from "../middleware/authenticationMiddleware.js";
import { requireRolePermissionForAction } from "../middleware/authorizationMiddleware.js";
import {
  uploadImageMiddleware,
  handleMulterErrors,
} from "../middleware/uploadMiddleware.js";
import { DEFINED_RESOURCE_ACTIONS } from "../config/rolesAndPermissionsConfig.js";
import {
  handleListResourcesRequest,
  handleListReferenceImagesRequest,
  handleListGeneratedImagesRequest,
  handleCreateResourceRequest,
  handleReadResourceRequest,
  handleUpdateResourceRequest,
  handleDeleteResourceRequest,
} from "../controllers/resourceController.js";

const protectedResourceRouter = express.Router();

/**
 * @swagger
 * /api/resources/generated:
 *   get:
 *     tags:
 *       - Resources
 *     summary: List only generated images (ComfyUI outputs)
 */
protectedResourceRouter.get(
  "/generated",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_READ),
  handleListGeneratedImagesRequest
);

/**
 * @swagger
 * /api/resources/references:
 *   get:
 *     tags:
 *       - Resources
 *     summary: List only reference images (uploaded by user)
 *     description: Returns only images uploaded directly by the user, excluding generated images
 *     responses:
 *       200:
 *         description: List of reference images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resources:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Resource"
 *       401:
 *         description: Unauthorized or missing token
 *       500:
 *         description: Server error
 */
protectedResourceRouter.get(
  "/references",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_READ),
  handleListReferenceImagesRequest
);

/**
 * @swagger
 * /api/resources:
 *   get:
 *     tags:
 *       - Resources
 *     summary: List all resources owned by the authenticated user
 *     description: Returns metadata for every image the current user has uploaded or generated. Requires READ permission.
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resources:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Resource"
 *       401:
 *         description: Unauthorized or missing token
 *       500:
 *         description: Server error
 */
protectedResourceRouter.get(
  "/",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_READ),
  handleListResourcesRequest
);

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
 *           type: string
 *           format: uuid
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
 *     summary: Update an existing image resource
 *     description: Replaces the image file for an existing resource. Requires UPDATE permission (admin, editor). Only the owning user may update.
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 description: Replacement image file (JPEG, PNG, GIF, WebP). Max 10MB
 *     responses:
 *       200:
 *         description: Resource updated successfully
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
 *         description: No file provided
 *       401:
 *         description: Unauthorized or missing token
 *       403:
 *         description: Insufficient permissions or not resource owner
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
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
 *           type: string
 *           format: uuid
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
