import { db } from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )

`)
  .then(() => {
    console.log('Tables created successfully!')
  })
  .catch((error) => {
    console.error('Error creating tables:', error)
  })
