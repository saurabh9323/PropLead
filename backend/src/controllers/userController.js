const userService = require("../services/userService");
const handleControllerError = require("../utils/controllerError");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(user);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await userService.getAllRoles();

    res.status(200).json(roles);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json(user);
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
};
