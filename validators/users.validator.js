// validators/users.validator.js
const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("", null),
  grade: Joi.number().integer().min(0).default(0),
  password: Joi.string().min(6).required(),
  designation: Joi.string().allow("", null),
  department: Joi.string().allow("", null),
  cnic: Joi.string().allow("", null),
  role: Joi.string().valid("manager", "employee").default("employee"),
  projects: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow("", null),
  grade: Joi.number().integer().min(0).optional(),
  password: Joi.string().min(6).optional(),
  designation: Joi.string().optional().allow("", null),
  department: Joi.string().optional().allow("", null),
  cnic: Joi.string().optional().allow("", null),
  role: Joi.string().valid("manager", "employee").optional(),
  projects: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
