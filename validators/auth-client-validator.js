import Joi from "joi";

const createClientschema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().min(2).required(),
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirmPassword: Joi.ref("password"),
  role: Joi.string().required(),
});

export const validate = (req, res, next) => {
  const { error } = createClientschema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
})


export const loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
