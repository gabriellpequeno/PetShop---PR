import { db } from "./db"
import { UsersFaker } from "../modules/users/fakers/users-faker";

async function seed() {
  console.log("Seeding database...")

  await db.exec("DELETE FROM users")

  const users = UsersFaker.fakeMany(10)

  for (const user of users) {
    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.password, user.role]
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