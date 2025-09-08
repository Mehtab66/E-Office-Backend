const Joi = require('joi');

const validateDeliverable = (data) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    description: Joi.string().required(),
    notes: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'delivered', 'approved', 'rejected').default('pending'),
  });
  return schema.validate(data);
};

module.exports = { validateDeliverable };