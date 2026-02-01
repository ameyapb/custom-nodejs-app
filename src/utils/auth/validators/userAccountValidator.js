import { body, validationResult } from "express-validator";
import { DEFINED_APPLICATION_ROLES } from "../../../config/rolesAndPermissionsConfig.js";

const validApplicationRolesArray = Object.values(DEFINED_APPLICATION_ROLES);

export const registrationRequestValidationRules = [
  body("emailAddress")
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("plainTextPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("assignedApplicationRole")
    .isIn(validApplicationRolesArray)
    .withMessage(
      `Role must be one of: ${validApplicationRolesArray.join(", ")}`
    ),
];

export const loginRequestValidationRules = [
  body("emailAddress")
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("plainTextPassword").notEmpty().withMessage("Password is required"),
];

export function extractValidationErrorsFromRequest(req) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrors
      .array()
      .map((individualError) => individualError.msg);
  }
  return null;
}
