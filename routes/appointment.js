import express from "express"
import { cancelAppointment, createAppointment } from "../controllers/appointment-controller.js";
import appointAuth from "../middilewares/appointmentAuth.js";

const router = express.Router();

router.post("/createAppointment",appointAuth ,createAppointment )
router.patch("/cancelAppointment", appointAuth, cancelAppointment)

export default router