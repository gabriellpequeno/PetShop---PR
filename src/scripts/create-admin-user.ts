
import { db } from "../database/db";
import { CryptoProvider } from "../modules/auth/providers/crypto-provider";

async function createAdminUser() {
    console.log("Setting up admin user...");

    const email = "admin@petshop.com";
    const password = "admin123";
    const cryptoProvider = new CryptoProvider();
    const hashedPassword = await cryptoProvider.generateHash(password);

    // Check if user exists
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser) {
        console.log(`User ${email} already exists. Updating password...`);
        await db.run(
            "UPDATE users SET password = ?, role = 'admin', name = 'Admin User' WHERE email = ?",
            [hashedPassword, email]
        );
        console.log("Admin user updated successfully.");
    } else {
        console.log(`Creating new admin user ${email}...`);
        const id = "admin-" + Date.now(); // Simple ID generation
        await db.run(
            "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [id, "Admin User", email, hashedPassword, "admin"]
        );
        console.log("Admin user created successfully.");
    }

    console.log("------------------------------------------------");
    console.log("Login: " + email);
    console.log("Password: " + password);
    console.log("------------------------------------------------");
}

createAdminUser()
    .then(() => console.log("Done."))
    .catch((err) => console.error("Error creating admin user:", err));
