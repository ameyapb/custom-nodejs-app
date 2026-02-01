import express from "express";
import { authenticateRequestViaJsonWebToken } from "../middleware/authenticationMiddleware.js";
import { requireRolePermissionForAction } from "../middleware/authorizationMiddleware.js";
import { DEFINED_RESOURCE_ACTIONS } from "../config/rolesAndPermissionsConfig.js";
import {
  handleCreateResourceRequest,
  handleReadResourceRequest,
  handleUpdateResourceRequest,
  handleDeleteResourceRequest,
} from "../controllers/resourceController.js";

const protectedResourceRouter = express.Router();

protectedResourceRouter.post(
  "/",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_CREATE),
  handleCreateResourceRequest
);

protectedResourceRouter.get(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_READ),
  handleReadResourceRequest
);

protectedResourceRouter.put(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_UPDATE),
  handleUpdateResourceRequest
);

protectedResourceRouter.delete(
  "/:resourceId",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_DELETE),
  handleDeleteResourceRequest
);

export default protectedResourceRouter;
