import { db } from "./db"
import { UsersFaker } from "../modules/users/fakers/users-faker";
import { CryptoProvider } from "../modules/auth/providers/crypto-provider";

async function seed() {
  console.log("Seeding database...")

  await db.exec("DELETE FROM users")

  const users = UsersFaker.fakeMany(10)
  const cryptoProvider = new CryptoProvider()

  for (const user of users) {
    const hashedPassword = await cryptoProvider.generateHash(user.password)
    
    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hashedPassword, user.role]
    )
  }
  console.log(`Created ${users.length} users.`)
}

seed()
  .then(() => {
    console.log("Seeding completed! 🌱")
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
  })