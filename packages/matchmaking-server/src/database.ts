import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { z } from "zod";

const env = z
  .object({
    CHAIN_ID: z.string().nonempty(),
  })
  .parse(process.env);

export async function openDb() {
  const filename = env.CHAIN_ID === "690" ? "/var/data/matchmaking.db" : "./data/matchmaking.db";

  return open({
    filename,
    driver: sqlite3.Database,
  });
}

export async function initializeDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS matchmaking_pool (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ethereum_address TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      refreshed_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pending_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1 TEXT NOT NULL,
      user2 TEXT NOT NULL,
      user3 TEXT NOT NULL,
      user4 TEXT NOT NULL,
      user1_confirmed INTEGER NOT NULL DEFAULT 0,
      user2_confirmed INTEGER NOT NULL DEFAULT 0,
      user3_confirmed INTEGER NOT NULL DEFAULT 0,
      user4_confirmed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS confirmed_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_entity TEXT NOT NULL,
      user1 TEXT NOT NULL,
      user2 TEXT NOT NULL,
      user3 TEXT NOT NULL,
      user4 TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export async function cleanDb() {
  const db = await openDb();
  await db.exec(`
    DELETE FROM matchmaking_pool;
    DELETE FROM pending_matches;
    DELETE FROM confirmed_matches;
  `);
}
