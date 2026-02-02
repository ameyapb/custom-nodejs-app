import { body, validationResult } from "express-validator";

export const registrationRequestValidationRules = [
  body("emailAddress")
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("plainTextPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  // Note: assignedApplicationRole is intentionally not validated here
  // All new registrations are assigned 'viewer' role server-side for security
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
