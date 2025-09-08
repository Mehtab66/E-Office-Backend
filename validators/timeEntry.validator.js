const Joi = require('joi');

const validateTimeEntry = (data) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    hours: Joi.number().min(0).required(),
    title: Joi.string().required(),
    note: Joi.string().allow(''),
    task: Joi.string().hex().length(24).optional(),
    approved: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

module.exports = { validateTimeEntry };