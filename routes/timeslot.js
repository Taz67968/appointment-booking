import express from "express";
import { timeslotValidator } from "../validators/auth-timeslot-validator.js";
import {
  createTimeslotHandler,
  updateTimeslot,
  deleteTimeslot,
  getAllTimeslots,
} from "../controllers/create-timeslot-controller.js";
import authMiddleware from "../middilewares/authmiddlewares.js";

const router = express.Router();

router.get(
  "/veiwTimeslot",
  authMiddleware,
  getAllTimeslots
);

router.post('/createTimeslot',
    authMiddleware,
    timeslotValidator, 
    createTimeslotHandler
  )

router.put(
  "/:id/updateTimeslot",
  authMiddleware,
  updateTimeslot
);

router.delete(
  "/:id/DeleteTimeslot",
  authMiddleware,
  deleteTimeslot
);
export default router;
