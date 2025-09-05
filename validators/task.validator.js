const Joi = require("joi");

const validateTask = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    assignedTo: Joi.string().required(),
    status: Joi.string().valid("todo", "in_progress", "done").optional(),
    dueDate: Joi.date().optional(),
  });
  return schema.validate(data);
};

module.exports = { validateTask };
