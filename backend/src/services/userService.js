const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/appError");
const { hashPassword } = require("../utils/password");
const { validateUuid } = require("../utils/validation");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRequiredText = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const getAllUsers = async () => userRepository.getAllUsers();

const getUserById = async (id) => {
  const userId = validateUuid(id, "user ID");
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const getAllRoles = async () => userRepository.getAllRoles();

const createUser = async ({ name, email, password, roleId }) => {
  const cleanName = validateRequiredText(name, "Name");
  const cleanEmail = validateRequiredText(email, "Email").toLowerCase();
  validateRequiredText(password, "Password");
  const cleanPassword = password;
  const cleanRoleId = validateUuid(roleId, "role ID");

  if (!emailPattern.test(cleanEmail)) {
    throw new AppError("Invalid email address", 400);
  }

  if (cleanPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existingUser = await userRepository.getUserByEmail(cleanEmail);

  if (existingUser) {
    throw new AppError("A user with this email already exists", 400);
  }

  const role = await userRepository.getRoleById(cleanRoleId);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const createdUser = await userRepository.createUser({
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hashPassword(cleanPassword),
    roleId: cleanRoleId,
  });

  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: role.name,
    created_at: createdUser.created_at,
    updated_at: createdUser.updated_at,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
};
