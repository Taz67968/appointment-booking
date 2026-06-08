import Joi from "joi";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const timeslotschema = Joi.object({
  workingDays: Joi.date().iso().required().messages({
    'date.base': 'workingDays must be a valid ISO date (e.g., YYYY-MM-DD)'
  }),
  startTime: Joi.string().pattern(timeRegex).required(),
  endTime: Joi.string().pattern(timeRegex).required()
});


export const timeslotValidator = (req, res, next) => {
    const { error } = timeslotschema.validate(req.body)
    if (error) {
       return res.status(400).json({message: error.details[0].message}) 
    }
    next()
}