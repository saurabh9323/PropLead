require("dotenv").config();
const pool = require("../src/db/db");
const { hashPassword } = require("../src/utils/password");
const { seedUser } = require("../src/repositories/userRepository");

async function main() {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_NAME = "Administrator",
  } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).",
    );
  const result = await seedUser(
    ADMIN_NAME,
    ADMIN_EMAIL.trim().toLowerCase(),
    await hashPassword(ADMIN_PASSWORD),
    "admin",
  );
  console.log(
    result ? "Admin created." : "Account already exists; no changes made.",
  );
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
