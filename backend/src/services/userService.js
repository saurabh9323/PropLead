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

  return createdUser;
};

const updateUser = async (id, { name, email, roleId }) => {
  const userId = validateUuid(id, "user ID");
  const cleanName = validateRequiredText(name, "Name");
  const cleanEmail = validateRequiredText(email, "Email").toLowerCase();
  const cleanRoleId = validateUuid(roleId, "role ID");

  if (!emailPattern.test(cleanEmail)) {
    throw new AppError("Invalid email address", 400);
  }

  const existingUser = await userRepository.getUserByEmail(cleanEmail);

  if (existingUser && existingUser.id !== userId) {
    throw new AppError("A user with this email already exists", 400);
  }

  const role = await userRepository.getRoleById(cleanRoleId);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const updatedUser = await userRepository.updateUser(userId, {
    name: cleanName,
    email: cleanEmail,
    roleId: cleanRoleId,
  });

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  return updatedUser;
};

const deleteUser = async (id, currentUserId) => {
  const userId = validateUuid(id, "user ID");

  if (currentUserId && userId === currentUserId) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const deletedUser = await userRepository.deleteUser(userId);

  if (!deletedUser) {
    throw new AppError("User not found", 404);
  }

  return deletedUser;
};

module.exports = {
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
  updateUser,
  deleteUser,
};
