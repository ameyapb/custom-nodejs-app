import pkg from "pg";
import logger from "../utils/system/logger.js";
import { config } from "../config/environment.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.dbUrl,
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
