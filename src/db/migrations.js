import fs from "fs/promises";
import path from "path";
import pool from "./connection.js";
import { config } from "../config/environment.js";
import logger from "../utils/system/logger.js";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "migrations");

export async function runMigrations() {
  try {
    // Create schema if it doesn't exist
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${config.dbSchema}`);
    logger.info(
      `Schema ensured. schema=${config.dbSchema}. [module=db/migrations, event=schema_ready]`
    );

    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${config.dbSchema}.migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get all migration files (SQL and JS)
    const files = await fs.readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter((f) => f.endsWith(".sql") || f.endsWith(".js"))
      .sort();

    for (const file of migrationFiles) {
      // Check if migration already ran
      const result = await pool.query(
        `SELECT name FROM ${config.dbSchema}.migrations WHERE name = $1`,
        [file]
      );

      if (result.rows.length > 0) {
        logger.info(
          `Migration already executed. file=${file}. [module=db/migrations, event=migration_skipped]`
        );
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);

      try {
        if (file.endsWith(".sql")) {
          // SQL migration
          const sql = await fs.readFile(filePath, "utf-8");
          await pool.query(`SET search_path TO ${config.dbSchema}; ${sql}`);
        } else if (file.endsWith(".js")) {
          // JavaScript migration
          const migration = await import(filePath);
          if (typeof migration.up === "function") {
            await migration.up(pool, config);
          }
        }

        // Record migration as executed
        await pool.query(
          `INSERT INTO ${config.dbSchema}.migrations (name) VALUES ($1)`,
          [file]
        );

        logger.info(
          `Migration executed. file=${file}. [module=db/migrations, event=migration_success]`
        );
      } catch (err) {
        logger.error(`Migration failed. file=${file}`, err);
        throw err;
      }
    }

    logger.info(
      `All migrations completed. schema=${config.dbSchema}. [module=db/migrations, event=migrations_complete]`
    );
  } catch (err) {
    logger.error("Migration process failed", err);
    throw err;
  }
}
