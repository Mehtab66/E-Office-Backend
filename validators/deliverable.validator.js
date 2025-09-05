const Joi = require("joi");

const deliverableValidator = Joi.object({
  project: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid project ID format",
    }),
  date: Joi.date().required(),
  description: Joi.string().trim().min(3).required(),
  notes: Joi.string().allow("", null),
  status: Joi.string().valid("pending", "delivered", "approved").optional(),
  createdBy: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
});

module.exports = { deliverableValidator };
