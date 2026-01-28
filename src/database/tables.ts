import { db } from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    priceP REAL NOT NULL,
    priceM REAL NOT NULL,
    priceG REAL NOT NULL,
    duration INTEGER NOT NULL -- Duração estimada em minutos
  );
`)

  .then(() => {
    console.log('Tables created successfully!')
  })
  .catch((error) => {
    console.error('Error creating tables:', error)
  })
