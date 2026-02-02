import {
  getAllUserAccounts,
  updateUserAccountRole,
} from "../db/queries/userAccountQueries.js";
import logger from "../utils/system/logger.js";
import { DEFINED_APPLICATION_ROLES } from "../config/rolesAndPermissionsConfig.js";

export async function handleListAllUsersRequest(req, res) {
  try {
    const users = await getAllUserAccounts();

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users.map((user) => ({
        id: user.id,
        email_address: user.email_address,
        assigned_role: user.assigned_role,
        created_at: user.created_at,
      })),
    });
  } catch (unexpectedError) {
    logger.error(
      "Failed to retrieve users. [module=controllers/admin, event=list_users_error]",
      unexpectedError
    );
    return res
      .status(500)
      .json({ message: "An unexpected error occurred while retrieving users" });
  }
}

export async function handleUpdateUserRoleRequest(req, res) {
  const { userId, newRole } = req.body;

  if (!userId || !newRole) {
    return res.status(400).json({ message: "userId and newRole are required" });
  }

  // Validate role
  const validRoles = Object.values(DEFINED_APPLICATION_ROLES);
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({
      message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
    });
  }

  try {
    const updatedUser = await updateUserAccountRole(userId, newRole);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(
      `User role updated. userId=${userId} newRole=${newRole}. [module=controllers/admin, event=role_update_success]`
    );

    return res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: updatedUser.id,
        email_address: updatedUser.email_address,
        assigned_role: updatedUser.assigned_role,
      },
    });
  } catch (unexpectedError) {
    logger.error(
      "Failed to update user role. [module=controllers/admin, event=role_update_error]",
      unexpectedError
    );
    return res
      .status(500)
      .json({
        message: "An unexpected error occurred while updating user role",
      });
  }
}
