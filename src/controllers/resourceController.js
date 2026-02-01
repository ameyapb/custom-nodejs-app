import {
  findUserAccountByEmailAddress,
  insertNewUserAccount,
} from "../db/queries/userAccountQueries.js";
import {
  hashPlainTextPassword,
  verifyPlainTextPasswordAgainstHash,
} from "../utils/auth/passwordHashingUtil.js";
import { generateSignedTokenForUserAccount } from "../utils/auth/jsonWebTokenUtil.js";

export async function registerNewUserAccount(
  emailAddress,
  plainTextPassword,
  assignedApplicationRole
) {
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

export async function handleCreateResourceRequest(req, res) {
  const payload = req.body || {};
  // Return a simple created resource representation (replace with real DB logic later)
  return res.status(201).json({
    message: "Resource created",
    resource: { id: Date.now().toString(), ...payload },
  });
}

export async function handleReadResourceRequest(req, res) {
  const { resourceId } = req.params;
  // Placeholder response
  return res.status(200).json({
    id: resourceId,
    data: { name: "sample", details: "Replace with DB-backed data" },
  });
}

export async function handleUpdateResourceRequest(req, res) {
  const { resourceId } = req.params;
  const updates = req.body || {};
  // Placeholder response
  return res.status(200).json({
    message: "Resource updated",
    id: resourceId,
    updates,
  });
}

export async function handleDeleteResourceRequest(req, res) {
  //   const { resourceId } = req.params;
  return res.status(204).send();
}
