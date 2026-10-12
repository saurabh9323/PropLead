const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  let actual;
  let expected;
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    actual = crypto.createHash("sha256").update(password).digest();
    expected = Buffer.from(stored, "hex");
  } else {
    const [algorithm, salt, hash] = stored.split("$");
    if (
      algorithm !== "scrypt" ||
      !/^[a-f0-9]{32}$/.test(salt || "") ||
      !/^[a-f0-9]{128}$/.test(hash || "")
    )
      return false;
    actual = await scrypt(password, salt, 64);
    expected = Buffer.from(hash, "hex");
  }
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}

module.exports = { hashPassword, verifyPassword };
