const Joi = require("joi");

const validateClient = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required().messages({
      "string.base": "Client name must be a string",
      "string.min": "Client name must be at least 2 characters long",
      "any.required": "Client name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    phone: Joi.string()
      .pattern(/^\+\d{7,15}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone number must be 7-15 digits and start with a country code",
        "any.required": "Phone number is required",
      }),
    country: Joi.string().required().messages({
      "any.required": "Country is required",
    }),
    currency: Joi.string().required().messages({
      "any.required": "Currency is required",
    }),
    billingAddress: Joi.string().min(5).required().messages({
      "string.min": "Billing address must be at least 5 characters long",
      "any.required": "Billing address is required",
    }),
    shippingAddress: Joi.string().min(5).required().messages({
      "string.min": "Shipping address must be at least 5 characters long",
      "any.required": "Shipping address is required",
    }),
  });

  return schema.validate(data);
};
module.exports = { validateClient };
