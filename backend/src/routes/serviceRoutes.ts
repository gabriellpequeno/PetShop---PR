import { Router, Request, Response } from "express";
import serviceController from "../controllers/serviceController.js";

const router = Router();

router.get("/service", serviceController.findAll);
router.post("/register/service", serviceController.save);
router.put("/update/service", serviceController.update);
router.delete("/delete/service", serviceController.delete);

export default router;