const Joi = require('joi');

const validateTask = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    assignees: Joi.array().items(Joi.string().hex().length(24)).optional(), // Updated
    priority: Joi.string().valid('urgent', 'high', 'medium', 'low').default('medium'),
    status: Joi.string().valid('todo', 'in_progress', 'done').default('todo'),
    dueDate: Joi.date().optional(),
    subtasks: Joi.array().items(
      Joi.object({
        _id: Joi.string().optional(),
        title: Joi.string().required(),
        status: Joi.string().valid('todo', 'in_progress', 'done').default('todo'),
        assignees: Joi.array().items(Joi.string().hex().length(24)).optional(),
      })
    ).optional(),
  });
  return schema.validate(data);
};

module.exports = { validateTask };