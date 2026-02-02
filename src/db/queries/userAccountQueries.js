import { runQuery } from "../queryRunner.js";

export async function findUserAccountByEmailAddress(emailAddress) {
  const queryText = `
    SELECT id, email_address, hashed_password, assigned_role, created_at, updated_at
    FROM user_accounts
    WHERE email_address = $1
  `;

  const queryResult = await runQuery(queryText, [emailAddress]);
  return queryResult.rows[0] || null;
}

export async function insertNewUserAccount(
  emailAddress,
  hashedPassword,
  assignedApplicationRole
) {
  const queryText = `
    INSERT INTO user_accounts (email_address, hashed_password, assigned_role)
    VALUES ($1, $2, $3)
    RETURNING id, email_address, assigned_role, created_at, updated_at
  `;

  const queryResult = await runQuery(queryText, [
    emailAddress,
    hashedPassword,
    assignedApplicationRole,
  ]);
  return queryResult.rows[0];
}

export async function getAllUserAccounts() {
  const queryText = `
    SELECT id, email_address, assigned_role, created_at, updated_at
    FROM user_accounts
    ORDER BY created_at DESC
  `;

  const queryResult = await runQuery(queryText, []);
  return queryResult.rows;
}

export async function updateUserAccountRole(userId, newRole) {
  const queryText = `
    UPDATE user_accounts
    SET assigned_role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, email_address, assigned_role, created_at, updated_at
  `;

  const queryResult = await runQuery(queryText, [newRole, userId]);
  return queryResult.rows[0] || null;
}
