import { db } from "./db"
import { UsersFaker } from "../modules/users/fakers/users-faker";
import { CryptoProvider } from "../modules/auth/providers/crypto-provider";

async function seed() {
  console.log("Seeding database...")

  await db.exec("DELETE FROM users")

  const users = UsersFaker.fakeMany(10)
  const cryptoProvider = new CryptoProvider()

  // Create a fixed admin user
  const adminPassword = await cryptoProvider.generateHash("admin123")
  await db.run(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [
      "admin-id-123",
      "Admin User",
      "admin@petshop.com",
      adminPassword,
      "admin"
    ]
  )
  console.log("Created default admin: admin@petshop.com / admin123")

  for (const user of users) {
    const hashedPassword = await cryptoProvider.generateHash(user.password)

    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hashedPassword, user.role]
    )
  }
  console.log(`Created ${users.length} random users.`)
}

seed()
  .then(() => {
    console.log("Seeding completed! 🌱")
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
  })