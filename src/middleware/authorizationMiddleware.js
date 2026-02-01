import { ROLE_TO_PERMITTED_ACTIONS_MAP } from "../config/rolesAndPermissionsConfig.js";
import logger from "../utils/system/logger.js";

export function requireRolePermissionForAction(requiredResourceAction) {
  return function enforceRoleBasedAccessControl(req, res, next) {
    const requestingUserRole = req.authenticatedUserRole;

    if (!requestingUserRole) {
      logger.warn(
        "RBAC check attempted with no role on request. [module=middleware/authorization, event=missing_role]"
      );
      return res.status(401).json({
        message: "Authenticated role is missing from the request context",
      });
    }

    const permissionsGrantedToRole =
      ROLE_TO_PERMITTED_ACTIONS_MAP[requestingUserRole];

    if (!permissionsGrantedToRole) {
      logger.warn(
        `Unrecognized role encountered: ${requestingUserRole}. [module=middleware/authorization, event=unknown_role]`
      );
      return res
        .status(403)
        .json({ message: "Unrecognized role assigned to authenticated user" });
    }

    const doesRoleHaveRequiredPermission = permissionsGrantedToRole.includes(
      requiredResourceAction
    );

    if (!doesRoleHaveRequiredPermission) {
      logger.warn(
        `Access denied. role=${requestingUserRole} action=${requiredResourceAction}. [module=middleware/authorization, event=access_denied]`
      );
      return res.status(403).json({
        message: `Role '${requestingUserRole}' does not have permission to perform '${requiredResourceAction}'`,
      });
    }

    next();
  };
}
