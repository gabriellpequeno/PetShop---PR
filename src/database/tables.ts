import { db } from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    birth_date TEXT
  );

  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    age INTEGER NOT NULL,
    weight REAL NOT NULL,
    size TEXT NOT NULL DEFAULT 'M',
    FOREIGN KEY(userId) REFERENCES users(id)
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

  CREATE TABLE IF NOT EXISTS job_availability (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    dayOfWeek INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, ..., 6=Sábado
    startTime TEXT NOT NULL,    -- Formato HH:MM (ex: "09:00")
    endTime TEXT NOT NULL,      -- Formato HH:MM (ex: "18:00")
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    petId TEXT NOT NULL,
    jobId TEXT NOT NULL,
    bookingDate TEXT NOT NULL,
    bookingTime TEXT NOT NULL DEFAULT '09:00', -- Horário do agendamento HH:MM
    status TEXT NOT NULL DEFAULT 'agendado',
    price REAL NOT NULL DEFAULT 0,
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
