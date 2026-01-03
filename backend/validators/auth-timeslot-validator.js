import Joi from "joi";

// Accept both HH:MM and HH:MM:SS formats
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeslotschema = Joi.object({
  workingDays: Joi.string().valid(...daysOfWeek).required().messages({
    'any.only': 'workingDays must be a valid day of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)',
    'string.empty': 'workingDays is required',
    'any.required': 'workingDays is required'
  }),
  startTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'startTime must be in HH:MM or HH:MM:SS format (e.g., 09:00 or 09:00:00)'
  }),
  endTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'endTime must be in HH:MM or HH:MM:SS format (e.g., 17:00 or 17:00:00)'
  })
});


export const timeslotValidator = (req, res, next) => {
    const { error } = timeslotschema.validate(req.body)
    if (error) {
       return res.status(400).json({message: error.details[0].message}) 
    }
    next()
}