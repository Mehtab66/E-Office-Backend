const Joi = require("joi");

const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required().messages({
      "string.base": "Name must be a string",
      "string.min": "Name must be at least 2 characters long",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    phone: Joi.string()
      .pattern(/^\d{3}-\d{3}-\d{4}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be in format 123-456-7890",
        "any.required": "Phone number is required",
      }),
    grade: Joi.number().integer().min(1).required().messages({
      "number.base": "Grade must be a number",
      "number.integer": "Grade must be an integer",
      "number.min": "Grade must be at least 1",
      "any.required": "Grade is required",
    }),
    designation: Joi.string().min(2).required().messages({
      "string.base": "Designation must be a string",
      "string.min": "Designation must be at least 2 characters long",
      "any.required": "Designation is required",
    }),
    cnic: Joi.string()
      .pattern(/^\d{5}-\d{7}-\d{1}$/)
      .required()
      .messages({
        "string.pattern.base": "CNIC must be in format 12345-1234567-1",
        "any.required": "CNIC is required",
      }),
  });

  return schema.validate(data);
};

const validateUpdateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required().messages({
      "string.base": "Name must be a string",
      "string.min": "Name must be at least 2 characters long",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    phone: Joi.string()
      .pattern(/^\d{3}-\d{3}-\d{4}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be in format 123-456-7890",
        "any.required": "Phone number is required",
      }),
    grade: Joi.number().integer().min(1).required().messages({
      "number.base": "Grade must be a number",
      "number.integer": "Grade must be an integer",
      "number.min": "Grade must be at least 1",
      "any.required": "Grade is required",
    }),
    designation: Joi.string().min(2).required().messages({
      "string.base": "Designation must be a string",
      "string.min": "Designation must be at least 2 characters long",
      "any.required": "Designation is required",
    }),
    cnic: Joi.string()
      .pattern(/^\d{5}-\d{7}-\d{1}$/)
      .required()
      .messages({
        "string.pattern.base": "CNIC must be in format 12345-1234567-1",
        "any.required": "CNIC is required",
      }),
  });

  return schema.validate(data);
};

module.exports = { validateUser, validateUpdateUser };
