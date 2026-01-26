import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../../database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'comum'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      service_id TEXT PRIMARY KEY,
      name_service TEXT NOT NULL,
      price_p DECIMAL NOT NULL,
      price_m DECIMAL NOT NULL,
      price_g DECIMAL NOT NULL
    )
  `);
});

export default db;
