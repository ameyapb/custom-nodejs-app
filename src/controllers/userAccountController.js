import {
  registerNewUserAccount,
  authenticateExistingUserAccount,
} from "../services/userAccountService.js";
import { extractValidationErrorsFromRequest } from "../utils/auth/validators/userAccountValidator.js";
import logger from "../utils/system/logger.js";

export async function handleUserRegistrationRequest(req, res) {
  const extractedValidationErrors = extractValidationErrorsFromRequest(req);
  if (extractedValidationErrors) {
    return res
      .status(400)
      .json({ validationErrors: extractedValidationErrors });
  }

  // Note: assignedApplicationRole is intentionally not extracted from request body
  // All new registrations are assigned 'viewer' role by the service
  const { emailAddress, plainTextPassword } = req.body;

  try {
    const registrationResult = await registerNewUserAccount(
      emailAddress,
      plainTextPassword
    );

    if (registrationResult.errorOccurred) {
      return res
        .status(registrationResult.errorStatusCode)
        .json({ message: registrationResult.errorMessage });
    }

    logger.info(
      `User account registered. id=${registrationResult.userAccountId} role=${registrationResult.assignedApplicationRole}. [module=controllers/userAccount, event=registration_success]`
    );

    return res.status(201).json({
      message: "User account created successfully",
      signedAuthenticationToken: registrationResult.signedAuthenticationToken,
      userAccountId: registrationResult.userAccountId,
      assignedApplicationRole: registrationResult.assignedApplicationRole,
    });
  } catch (unexpectedError) {
    logger.error(
      "Registration failed unexpectedly. [module=controllers/userAccount, event=registration_error]",
      unexpectedError
    );
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during registration" });
  }
}

export async function handleUserLoginRequest(req, res) {
  const extractedValidationErrors = extractValidationErrorsFromRequest(req);
  if (extractedValidationErrors) {
    return res
      .status(400)
      .json({ validationErrors: extractedValidationErrors });
  }

  const { emailAddress, plainTextPassword } = req.body;

  try {
    const authenticationResult = await authenticateExistingUserAccount(
      emailAddress,
      plainTextPassword
    );

    if (authenticationResult.errorOccurred) {
      return res
        .status(authenticationResult.errorStatusCode)
        .json({ message: authenticationResult.errorMessage });
    }

    logger.info(
      `User account authenticated. id=${authenticationResult.userAccountId}. [module=controllers/userAccount, event=login_success]`
    );

    return res.status(200).json({
      message: "Login successful",
      signedAuthenticationToken: authenticationResult.signedAuthenticationToken,
      userAccountId: authenticationResult.userAccountId,
      assignedApplicationRole: authenticationResult.assignedApplicationRole,
    });
  } catch (unexpectedError) {
    logger.error(
      "Login failed unexpectedly. [module=controllers/userAccount, event=login_error]",
      unexpectedError
    );
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during login" });
  }
}
