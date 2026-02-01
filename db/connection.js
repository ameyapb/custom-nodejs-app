import dotenv from "dotenv";
import pkg from "pg";
import logger from "../utils/logger.js";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.on("connect", () => {
  logger.info(
    "Database connection established. [module=db/connection, event=connect]"
  );
});

pool.on("error", (err) => {
  logger.error(
    "Unexpected database error. [module=db/connection, event=error]",
    err
  );
  process.exit(-1);
});

export default pool;
