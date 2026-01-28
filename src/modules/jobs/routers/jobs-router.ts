import { Router } from "express";
import { JobsController } from "../controllers/jobs-controller";

const jobsRouter = Router();

jobsRouter.post("/", JobsController.create);
jobsRouter.get("/", JobsController.list);
jobsRouter.put("/:id", JobsController.update);
jobsRouter.delete("/:id", JobsController.delete);

export { jobsRouter };
