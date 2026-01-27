import { db } from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )
`)
  .then(() => {
    console.log('Tables created successfully!')
  })
  .catch((error) => {
    console.error('Error creating tables:', error)
  })
