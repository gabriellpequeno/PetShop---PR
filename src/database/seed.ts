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
  const defaultPassword = "123456"

  const fixedUsers = [
    UsersFaker.fake({
      id: "admin-user-id-001",
      name: "Administrador",
      email: "admin@gmail.com",
      password: defaultPassword,
      role: "admin"
    }),
    UsersFaker.fake({
      id: "user-001",
      name: "Maria Silva",
      email: "user@gmail.com",
      password: defaultPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-002",
      name: "João Santos",
      email: "joao@gmail.com",
      password: defaultPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-003",
      name: "Ana Oliveira",
      email: "ana@gmail.com",
      password: defaultPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      id: "user-004",
      name: "Pedro Costa",
      email: "pedro@gmail.com",
      password: defaultPassword,
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
    const pets = PetsFaker.fakeMany(5, { userId: customer.id })
    
    for (const pet of pets) {
      await db.run(
        `INSERT INTO pets (id, userId, name, species, breed, age, weight, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet.id, pet.userId, pet.name, pet.species, pet.breed, pet.age, pet.weight, pet.size]
      )
    }
    totalPets += pets.length
  }
  
  console.log(`Created ${totalPets} pets (5 per customer).`)
}

seed()
  .then(() => {
    console.log("Seeding completed! 🌱")
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
  })