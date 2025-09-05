const Joi = require("joi");

const validateProject = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    client: Joi.string().required(), // ObjectId as string
    status: Joi.string().valid("active", "pending", "completed").required(),
    startDate: Joi.date().required(),
    estimatedTime: Joi.string().required(),
    teamLead: Joi.string().required(), // ObjectId as string
    teamMembers: Joi.array().items(Joi.string()).optional(),
  });
  return schema.validate(data);
};

module.exports = { validateProject };
