import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUND_COUNT = 12;
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "AdminPassword123!";

/**
 * Create default admin account if no admin exists
 *
 * IMPORTANT: Change the default password immediately after first login!
 * Default Credentials:
 *   Email: admin@example.com
 *   Password: AdminPassword123!
 */
export async function up(pool, config) {
  try {
    // Check if any admin account already exists
    const adminCheck = await pool.query(
      `SELECT id FROM ${config.dbSchema}.user_accounts WHERE assigned_role = 'admin' LIMIT 1`
    );

    if (adminCheck.rows.length > 0) {
      console.log("Admin account already exists, skipping bootstrap");
      return;
    }

    // Check if the email already exists (for safety)
    const emailCheck = await pool.query(
      `SELECT id FROM ${config.dbSchema}.user_accounts WHERE email_address = $1 LIMIT 1`,
      [DEFAULT_ADMIN_EMAIL]
    );

    if (emailCheck.rows.length > 0) {
      console.log("Email already exists, skipping bootstrap");
      return;
    }

    // Hash the default password
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUND_COUNT);
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);

    // Insert default admin account
    await pool.query(
      `INSERT INTO ${config.dbSchema}.user_accounts (email_address, hashed_password, assigned_role) VALUES ($1, $2, $3)`,
      [DEFAULT_ADMIN_EMAIL, hashedPassword, "admin"]
    );

    console.log(
      `Default admin account created: ${DEFAULT_ADMIN_EMAIL}\n` +
        `⚠️  IMPORTANT: Change password immediately after first login!\n` +
        `Default password: ${DEFAULT_ADMIN_PASSWORD}`
    );
  } catch (err) {
    console.error("Error creating default admin account", err);
    throw err;
  }
}
