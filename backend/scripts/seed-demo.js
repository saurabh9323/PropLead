const pool = require("../src/db/db");
const { seedUser } = require("../src/repositories/userRepository");
const { hashPassword } = require("../src/utils/password");

async function seed() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in backend/.env and run db:setup first.");
  for (const [name, email, password, role] of [
    ["Demo Admin", "admin@proplead.test", "Admin@123", "admin"],
    ["Demo CRM", "crm@proplead.test", "Crm@123", "CRM"],
  ]) {
    const user = await seedUser(
      name,
      email,
      await hashPassword(password),
      role,
    );
    console.log(`${email}: ${user ? "created" : "already exists; unchanged"}`);
  }
}
seed()
  .catch((error) => {
    console.error(error.message || error.code || "Database connection unavailable");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
