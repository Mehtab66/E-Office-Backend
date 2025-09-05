const Joi = require("joi");

// Validation schema for creating/updating a time entry
const timeEntryValidator = Joi.object({
  user: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
  project: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid project ID format",
    }),
  date: Joi.date().required(),
  hours: Joi.number().min(0).required(),
  title: Joi.string().trim().min(3).required(),
  note: Joi.string().allow("", null),
  task: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid task ID format",
    }),
  approved: Joi.boolean().optional(),
});

module.exports = { timeEntryValidator };
