import pkg from "pg";
import logger from "../utils/system/logger.js";
import { config } from "../config/environment.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.dbUrl,
  min: config.dbPoolMin,
  max: config.dbPoolMax,
});

// Set search_path when a new client is connected
pool.on("connect", (client) => {
  client
    .query(`SET search_path TO ${config.dbSchema}`)
    .then(() => {
      logger.info(
        `Database connection established. [module=db/connection, event=connect, schema=${config.dbSchema}]`
      );
    })
    .catch((err) => {
      logger.error(
        `Failed to set search_path for new connection. [module=db/connection, event=set_search_path]`,
        err
      );
    });
});

pool.on("error", (err) => {
  logger.error(
    "Unexpected database error. [module=db/connection, event=error]",
    err
  );
  process.exit(-1);
});

export default pool;
