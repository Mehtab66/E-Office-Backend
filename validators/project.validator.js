const validateProject = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required().messages({
      "string.base": "Project name must be a string",
      "string.min": "Project name must be at least 2 characters long",
      "any.required": "Project name is required",
    }),
    client: Joi.string().required().messages({
      "any.required": "Client is required",
    }),
    status: Joi.string()
      .valid("active", "pending", "completed")
      .required()
      .messages({
        "any.only": "Status must be one of: active, pending, completed",
        "any.required": "Status is required",
      }),
    startDate: Joi.date().required().messages({
      "date.base": "Start date must be a valid date",
      "any.required": "Start date is required",
    }),
    estimatedTime: Joi.string().min(2).required().messages({
      "string.min": "Estimated time must be at least 2 characters long",
      "any.required": "Estimated time is required",
    }),
    teamLead: Joi.string().required().messages({
      "any.required": "Team lead is required",
    }),
    teamMembers: Joi.string().required().messages({
      "any.required": "Team members are required",
    }),
  });

  return schema.validate(data);
};
module.exports = {  validateProject };