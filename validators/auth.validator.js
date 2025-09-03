const Joi = require("joi");

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateUpdatePassword = (data) => {
  const schema = Joi.object({
    newPassword: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports = { validateLogin, validateUpdatePassword };
