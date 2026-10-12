const { z } = require("zod");
const AppError = require("./appError");

const uuidSchema = z.string().uuid();

const validateUuid = (id, fieldName = "ID") => {
  const result = uuidSchema.safeParse(id);

  if (!result.success) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }

  return result.data;
};

const validateWithSchema = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    throw new AppError(message, 400);
  }

  return result.data;
};

module.exports = {
  validateUuid,
  validateWithSchema,
  z,
};
