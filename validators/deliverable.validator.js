const Joi = require("joi");
const { Types } = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

const validateDeliverable = (data) => {
  const schema = Joi.object({
    date: Joi.date().iso().required(),
    description: Joi.string().min(3).max(255).required(),
    notes: Joi.string().max(1000).allow("").optional(),
    status: Joi.string()
      .valid("pending", "delivered", "approved") // Align with Mongoose
      .default("pending"),
    parent: Joi.alternatives().try(objectId, Joi.allow(null)).optional(),
    createdBy: objectId.required(), // Add validation for createdBy
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateDeliverable };
  