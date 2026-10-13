const authRepository = require("../repositories/authRepository");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/password");

const tokenExpirySeconds = 60 * 60;

const login = async ({ email, password }) => {
  if (typeof email !== "string" || email.trim() === "") {
    throw new AppError("Email is required", 400);
  }

  if (typeof password !== "string" || password.trim() === "") {
    throw new AppError("Password is required", 400);
  }

  const user = await authRepository.getUserByEmail(email.trim());

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.password_hash.startsWith("scrypt$")) {
    await authRepository.updatePasswordHash(user.id, await hashPassword(password));
  }

  const token = signToken(
    {
      userId: user.id,
      role: user.role,
    },
    tokenExpirySeconds
  );

  return authRepository.createSession(user.id, token, tokenExpirySeconds);
};

const getProfile = async (userId) => {
  const user = await authRepository.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const logout = async () => authRepository.logout();

module.exports = {
  login,
  getProfile,
  logout,
};
