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
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    age INTEGER NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
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

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    petId TEXT NOT NULL,
    jobId TEXT NOT NULL,
    bookingDate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado',
    realStartTime TEXT,
    realEndTime TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (petId) REFERENCES pets(id),
    FOREIGN KEY (jobId) REFERENCES jobs(id)
  );
`)

  .then(() => {
    console.log('Tables created successfully!')
  })
  .catch((error) => {
    console.error('Error creating tables:', error)
  })
