import Joi from "joi";

const createAppointmentSchema = Joi.object({
    slotId: Joi.string().uuid().required()
});

export const  createAppointment = (req,res,next) =>{
    const { error, value } = createAppointmentSchema.validate(req.body);
    if (error){ return res.status(400).json({ message: error.details[0].message })
    }
  next();
}