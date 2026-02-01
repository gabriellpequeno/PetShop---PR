import 'dotenv/config';
import { db } from "./db"
import { UsersFaker } from "../modules/users/fakers/users-faker";
import { PetsFaker } from "../modules/pets/fakers/pets-faker";
import { CryptoProvider } from "../modules/auth/providers/crypto-provider";

async function seed() {
  console.log("Seeding database...")

  await db.exec("DELETE FROM bookings")
  await db.exec("DELETE FROM pets")
  await db.exec("DELETE FROM users")

  const cryptoProvider = new CryptoProvider()
  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword) {
    console.error("SEED_PASSWORD is required to run the seeder. Please set SEED_PASSWORD in your .env and retry.");
    process.exit(1);
  }
  if (seedPassword.length < 8) {
    console.error("SEED_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }
  console.log("Using SEED_PASSWORD from environment for seeded users (hidden)")

  const fixedUsers = [
    UsersFaker.fake({
      id: "admin-user-id-001",
      name: "Administrador",
      email: "admin@gmail.com",
      password: seedPassword,
      role: "admin"
    }),
    UsersFaker.fake({
      id: "user-001",
      name: "Thigszin",
      email: "user@gmail.com",
      password: seedPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-002",
      name: "João Santos",
      email: "joao@gmail.com",
      password: seedPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-003",
      name: "Ana Oliveira",
      email: "ana@gmail.com",
      password: seedPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-004",
      name: "Pedro Costa",
      email: "pedro@gmail.com",
      password: seedPassword,
      role: "customer"
    })
  ]

  for (const user of fixedUsers) {
    const hashedPassword = await cryptoProvider.generateHash(user.password)

    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hashedPassword, user.role]
    )
  }
  console.log(`Created ${fixedUsers.length} users.`)

  const customers = fixedUsers.filter(u => u.role === "customer")
  let totalPets = 0

  for (const customer of customers) {
    const petCount = customer.id === "user-001" ? 3 : 5
    const pets = PetsFaker.fakeMany(petCount, { userId: customer.id })
    
    for (const pet of pets) {
      await db.run(
        `INSERT INTO pets (id, userId, name, species, breed, age, weight, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet.id, pet.userId, pet.name, pet.species, pet.breed, pet.age, pet.weight, pet.size]
      )
    }
    totalPets += pets.length
  }
  
  console.log(`Created ${totalPets} pets.`)

  const userPets = await db.all(`SELECT id, name FROM pets WHERE userId = ?`, ["user-001"])
  
  const jobs = await db.all(`SELECT id, name FROM jobs LIMIT 5`)
  
  if (userPets.length > 0 && jobs.length > 0) {
    const bookings = [
      {
        id: "booking-001",
        userId: "user-001",
        petId: userPets[0]?.id,
        jobId: jobs[0]?.id,
        bookingDate: "2026-01-25",
        bookingTime: "10:00",
        status: "concluido",
        price: 50.0,
        realStartTime: "2026-01-25 10:05",
        realEndTime: "2026-01-25 11:30",
        createdAt: "2026-01-20 08:00:00"
      },
      {
        id: "booking-002",
        userId: "user-001",
        petId: userPets[1]?.id || userPets[0]?.id,
        jobId: jobs[1]?.id || jobs[0]?.id,
        bookingDate: "2026-01-26",
        bookingTime: "14:00",
        status: "concluido",
        price: 35.0,
        realStartTime: "2026-01-26 14:00",
        realEndTime: "2026-01-26 15:45",
        createdAt: "2026-01-21 09:00:00"
      },
      {
        id: "booking-003",
        userId: "user-001",
        petId: userPets[2]?.id || userPets[0]?.id,
        jobId: jobs[2]?.id || jobs[0]?.id,
        bookingDate: "2026-01-27",
        bookingTime: "09:00",
        status: "concluido",
        price: 80.0,
        realStartTime: "2026-01-27 09:10",
        realEndTime: "2026-01-27 10:30",
        createdAt: "2026-01-22 10:00:00"
      },
      {
        id: "booking-004",
        userId: "user-001",
        petId: userPets[0]?.id,
        jobId: jobs[3]?.id || jobs[0]?.id,
        bookingDate: "2026-01-28",
        bookingTime: "11:00",
        status: "concluido",
        price: 45.0,
        realStartTime: "2026-01-28 11:00",
        realEndTime: "2026-01-28 12:15",
        createdAt: "2026-01-23 11:00:00"
      },
      {
        id: "booking-005",
        userId: "user-001",
        petId: userPets[1]?.id || userPets[0]?.id,
        jobId: jobs[4]?.id || jobs[0]?.id,
        bookingDate: "2026-01-29",
        bookingTime: "15:00",
        status: "cancelado",
        price: 60.0,
        realStartTime: null,
        realEndTime: null,
        createdAt: "2026-01-24 12:00:00"
      },
      {
        id: "booking-006",
        userId: "user-001",
        petId: userPets[0]?.id,
        jobId: jobs[0]?.id,
        bookingDate: "2026-01-30",
        bookingTime: "10:00",
        status: "agendado",
        price: 50.0,
        realStartTime: null,
        realEndTime: null,
        createdAt: "2026-01-25 08:00:00"
      },
      {
        id: "booking-007",
        userId: "user-001",
        petId: userPets[2]?.id || userPets[0]?.id,
        jobId: jobs[1]?.id || jobs[0]?.id,
        bookingDate: "2026-02-02",
        bookingTime: "14:00",
        status: "agendado",
        price: 35.0,
        realStartTime: null,
        realEndTime: null,
        createdAt: "2026-01-26 09:00:00"
      },
      {
        id: "booking-008",
        userId: "user-001",
        petId: userPets[1]?.id || userPets[0]?.id,
        jobId: jobs[2]?.id || jobs[0]?.id,
        bookingDate: "2026-02-05",
        bookingTime: "09:00",
        status: "agendado",
        price: 80.0,
        realStartTime: null,
        realEndTime: null,
        createdAt: "2026-01-27 10:00:00"
      }
    ]

    for (const booking of bookings) {
      if (booking.petId && booking.jobId) {
        await db.run(
          `INSERT INTO bookings (id, userId, petId, jobId, bookingDate, bookingTime, status, price, realStartTime, realEndTime, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            booking.id,
            booking.userId,
            booking.petId,
            booking.jobId,
            booking.bookingDate,
            booking.bookingTime,
            booking.status,
            booking.price,
            booking.realStartTime,
            booking.realEndTime,
            booking.createdAt
          ]
        )
      }
    }
    console.log(`Created ${bookings.length} bookings for user-001 (Thigszin).`)
  } else {
    console.log("Skipping bookings: No pets or jobs found.")
  }
}

seed()
  .then(() => {
    console.log("Seeding completed! 🌱")
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
  })