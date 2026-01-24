import { Router, Request, Response } from "express";
import serviceController from "../controllers/serviceController.js";

const router = Router();

router.get("/", serviceController.findAll);
router.post("/register/", serviceController.save);
router.put("/update/", serviceController.update);
router.delete("/delete/", serviceController.delete);

export default router;