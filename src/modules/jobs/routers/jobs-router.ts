import { Router } from "express";
import { CreateJobController } from "../controllers/create-job-controller";
import { ListJobsController } from "../controllers/list-jobs-controller";
import { UpdateJobController } from "../controllers/update-job-controller";
import { DeleteJobController } from "../controllers/delete-job-controller";

const jobsRouter = Router();

jobsRouter.post("/", CreateJobController.handle);
jobsRouter.get("/", ListJobsController.handle);
jobsRouter.put("/:id", UpdateJobController.handle);
jobsRouter.delete("/:id", DeleteJobController.handle);

export { jobsRouter };
