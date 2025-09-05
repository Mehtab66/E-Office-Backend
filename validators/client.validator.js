const Joi = require("joi");

const validateClient = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    country: Joi.string().required(),
    currency: Joi.string().required(),
    billingAddress: Joi.string().required(),
    shippingAddress: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = { validateClient };
