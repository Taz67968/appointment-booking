import Joi from "joi";

const createProviderSchema = Joi.object({
    first_name: Joi.string().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required',
    }),
    last_name: Joi.string().required(),
    email: Joi.string().email({ maxDomainSegments: 2 }).required(),
    profession: Joi.string().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    confirmPassword: Joi.ref("password"),
    description: Joi.string().required(),
    booked: Joi.boolean().required(),
  });

export const validateProvider = (req, res, next) => {
  const { error } = createProviderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
})


export const loginValidatorProvider = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
