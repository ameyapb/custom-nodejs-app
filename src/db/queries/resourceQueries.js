import { runQuery } from "../queryRunner.js";

export async function insertNewResource(
  userId,
  filename,
  filePath,
  fileSizeBytes,
  mimeType
) {
  const queryText = `
    INSERT INTO resources (user_id, filename, file_path, file_size_bytes, mime_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, filename, file_path, file_size_bytes, mime_type, created_at, updated_at
  `;

  const queryResult = await runQuery(queryText, [
    userId,
    filename,
    filePath,
    fileSizeBytes,
    mimeType,
  ]);
  return queryResult.rows[0];
}

export async function findResourceById(resourceId) {
  const queryText = `
    SELECT id, user_id, filename, file_path, file_size_bytes, mime_type, created_at, updated_at
    FROM resources
    WHERE id = $1
  `;

  const queryResult = await runQuery(queryText, [resourceId]);
  return queryResult.rows[0] || null;
}

export async function findResourcesByUserId(userId) {
  const queryText = `
    SELECT id, user_id, filename, file_path, file_size_bytes, mime_type, created_at, updated_at
    FROM resources
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const queryResult = await runQuery(queryText, [userId]);
  return queryResult.rows;
}

export async function deleteResourceById(resourceId) {
  const queryText = `
    DELETE FROM resources
    WHERE id = $1
    RETURNING id
  `;

  const queryResult = await runQuery(queryText, [resourceId]);
  return queryResult.rows[0] || null;
}
