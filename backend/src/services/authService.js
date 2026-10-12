const authRepository = require("../repositories/authRepository");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/jwt");
const { hashPassword } = require("../utils/password");

const tokenExpirySeconds = 60 * 60;

const login = async ({ email, password }) => {
  if (typeof email !== "string" || email.trim() === "") {
    throw new AppError("Email is required", 400);
  }

  if (typeof password !== "string" || password.trim() === "") {
    throw new AppError("Password is required", 400);
  }

  const user = await authRepository.getUserByEmail(email.trim());

  if (!user || user.password_hash !== hashPassword(password)) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(
    {
      userId: user.id,
      role: user.role,
    },
    tokenExpirySeconds
  );

  return {
    token,
    expiresIn: tokenExpirySeconds,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (userId) => {
  const user = await authRepository.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const logout = async () => ({
  loggedOut: true,
});

module.exports = {
  login,
  getProfile,
  logout,
};
