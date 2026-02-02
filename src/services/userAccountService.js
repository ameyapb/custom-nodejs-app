import {
  findUserAccountByEmailAddress,
  insertNewUserAccount,
} from "../db/queries/userAccountQueries.js";
import {
  hashPlainTextPassword,
  verifyPlainTextPasswordAgainstHash,
} from "../utils/auth/passwordHashingUtil.js";
import { generateSignedTokenForUserAccount } from "../utils/auth/jsonWebTokenUtil.js";
import { DEFINED_APPLICATION_ROLES } from "../config/rolesAndPermissionsConfig.js";

export async function registerNewUserAccount(emailAddress, plainTextPassword) {
  // Always assign 'viewer' role to new registrations
  // Role elevation must be done by an admin through a separate endpoint
  const assignedApplicationRole = DEFINED_APPLICATION_ROLES.ROLE_VIEWER;

  const existingUserAccountWithSameEmail =
    await findUserAccountByEmailAddress(emailAddress);
  if (existingUserAccountWithSameEmail) {
    return {
      errorOccurred: true,
      errorStatusCode: 409,
      errorMessage: "An account with this email address already exists",
    };
  }

  const resultingHashedPassword =
    await hashPlainTextPassword(plainTextPassword);

  const newlyCreatedUserAccount = await insertNewUserAccount(
    emailAddress,
    resultingHashedPassword,
    assignedApplicationRole
  );

  const signedTokenForNewAccount = generateSignedTokenForUserAccount(
    newlyCreatedUserAccount.id,
    newlyCreatedUserAccount.assigned_role
  );

  return {
    errorOccurred: false,
    signedAuthenticationToken: signedTokenForNewAccount,
    userAccountId: newlyCreatedUserAccount.id,
    assignedApplicationRole: newlyCreatedUserAccount.assigned_role,
  };
}

export async function authenticateExistingUserAccount(
  emailAddress,
  plainTextPassword
) {
  const matchingUserAccount = await findUserAccountByEmailAddress(emailAddress);
  if (!matchingUserAccount) {
    return {
      errorOccurred: true,
      errorStatusCode: 401,
      errorMessage: "Invalid email address or password",
    };
  }

  const doesProvidedPasswordMatchStoredHash =
    await verifyPlainTextPasswordAgainstHash(
      plainTextPassword,
      matchingUserAccount.hashed_password
    );

  if (!doesProvidedPasswordMatchStoredHash) {
    return {
      errorOccurred: true,
      errorStatusCode: 401,
      errorMessage: "Invalid email address or password",
    };
  }

  const signedTokenForExistingAccount = generateSignedTokenForUserAccount(
    matchingUserAccount.id,
    matchingUserAccount.assigned_role
  );

  return {
    errorOccurred: false,
    signedAuthenticationToken: signedTokenForExistingAccount,
    userAccountId: matchingUserAccount.id,
    assignedApplicationRole: matchingUserAccount.assigned_role,
  };
}
