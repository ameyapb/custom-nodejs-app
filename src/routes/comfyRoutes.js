import express from "express";
import { authenticateRequestViaJsonWebToken } from "../middleware/authenticationMiddleware.js";
import { requireRolePermissionForAction } from "../middleware/authorizationMiddleware.js";
import { DEFINED_RESOURCE_ACTIONS } from "../config/rolesAndPermissionsConfig.js";
import { handleGenerateFromPrompt } from "../controllers/comfyController.js";

const comfyRouter = express.Router();

comfyRouter.post(
  "/generate",
  authenticateRequestViaJsonWebToken,
  requireRolePermissionForAction(DEFINED_RESOURCE_ACTIONS.ACTION_CREATE),
  handleGenerateFromPrompt
);

export default comfyRouter;
