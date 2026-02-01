import pkg from "pg";
import logger from "../utils/system/logger.js";
import { config } from "../config/environment.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.dbUrl,
  min: config.dbPoolMin,
  max: config.dbPoolMax,
});

// Set search_path when a new connection is created
pool.on("connect", async (client) => {
  await client.query(`SET search_path TO ${config.dbSchema}`);
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
