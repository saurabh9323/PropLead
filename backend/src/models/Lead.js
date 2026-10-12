const AppError = require("../utils/appError");

const requireString = (value, message) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(message, 400);
  }

  return value.trim();
};

const normalizeEmail = (email) => {
  if (email === undefined || email === null || email === "") {
    return null;
  }

  if (typeof email !== "string") {
    throw new AppError("Invalid email", 400);
  }

  const trimmedEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmedEmail)) {
    throw new AppError("Invalid email", 400);
  }

  return trimmedEmail;
};

const normalizeBudget = (budget) => {
  if (budget === undefined || budget === null || budget === "") {
    throw new AppError("Budget is required", 400);
  }

  const numericBudget = Number(budget);

  if (!Number.isFinite(numericBudget)) {
    throw new AppError("Budget must be a valid number", 400);
  }

  if (numericBudget < 0) {
    throw new AppError("Budget cannot be negative", 400);
  }

  return numericBudget;
};

const allowedStatuses = ["New", "Contacted", "Site Visit", "Closed"];

const normalizeStatus = (status) => {
  if (typeof status !== "string" || status.trim() === "") {
    throw new AppError("Invalid lead status", 400);
  }

  const trimmedStatus = status.trim();

  if (!allowedStatuses.includes(trimmedStatus)) {
    throw new AppError("Invalid lead status", 400);
  }

  return trimmedStatus;
};

class Lead {
  constructor({
    id = null,
    name,
    phone,
    email = null,
    budget,
    location,
    property_type,
    source,
    status = "New",
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.name = requireString(name, "Name is required");
    this.phone = requireString(phone, "Phone is required");
    this.email = normalizeEmail(email);
    this.budget = normalizeBudget(budget);
    this.location = requireString(location, "Location is required");
    this.property_type = requireString(property_type, "Property type is required");
    this.source = requireString(source, "Source is required");
    this.status = normalizeStatus(status);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Lead;
