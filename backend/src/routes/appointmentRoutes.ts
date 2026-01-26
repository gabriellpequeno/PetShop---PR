import { Router, Request, Response } from "express";
import appointmentController from "../controllers/appointmentController.js";

const router = Router();

router.get("/", appointmentController.findAll);
router.post("/register/", appointmentController.save);
router.put("/update/", appointmentController.update);
router.delete("/delete/", appointmentController.delete);

export default router;
