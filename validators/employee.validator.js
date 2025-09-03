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
      .pattern(/^\+?[1-9]\d{1,3}?[ -.]?\d{1,12}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone number must be a valid international number (e.g., +12025550123, +447911123456, 123-456-7890)",
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
    department: Joi.string().min(2).required().messages({
      "string.base": "Department must be a string",
      "string.min": "Department must be at least 2 characters long",
      "any.required": "Department is required",
    }),
    cnic: Joi.string()
      .pattern(/^\d{5}-\d{7}-\d{1}$/)
      .required()
      .messages({
        "string.pattern.base": "CNIC must be in format 12345-1234567-1",
        "any.required": "CNIC is required",
      }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
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
      .pattern(/^\+?[1-9]\d{1,3}?[ -.]?\d{1,12}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone number must be a valid international number (e.g., +12025550123, +447911123456, 123-456-7890)",
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
    department: Joi.string().min(2).required().messages({
      "string.base": "Department must be a string",
      "string.min": "Department must be at least 2 characters long",
      "any.required": "Department is required",
    }),
    cnic: Joi.string()
      .pattern(/^\d{5}-\d{7}-\d{1}$/)
      .required()
      .messages({
        "string.pattern.base": "CNIC must be in format 12345-1234567-1",
        "any.required": "CNIC is required",
      }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .optional()
      .allow("")
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateUser, validateUpdateUser };
