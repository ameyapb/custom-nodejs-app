import pool from "./connection.js";

/**
 * Runs a query against the database and returns the result with latency information.
 *
 * @param {string} text        - The SQL query string (use $1, $2... for params)
 * @param {Array}  [params=[]] - Optional parameterized values
 * @returns {Promise<{ rows: any[], rowCount: number, latencyMs: number }>} The query result with latency
 *
 * @example
 *   const result = await runQuery("SELECT * FROM users WHERE id = $1", [userId]);
 *   console.log(result.rows, result.latencyMs);
 */
export async function runQuery(text, params = []) {
  const start = Date.now();

  try {
    const res = await pool.query(text, params);

    return {
      rows: res.rows,
      rowCount: res.rowCount,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    err.latencyMs = Date.now() - start;
    throw err;
  }
}
