import { Router } from "express";
import { CreateJobController } from "../controllers/create-job-controller";
import { ListJobsController } from "../controllers/list-jobs-controller";
import { UpdateJobController } from "../controllers/update-job-controller";
import { DeleteJobController } from "../controllers/delete-job-controller";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";

const jobsRouter = Router();

jobsRouter.post("/", EnsureAuthenticationMiddleware.handle, CreateJobController.handle);
jobsRouter.get("/", EnsureAuthenticationMiddleware.handle, ListJobsController.handle);
jobsRouter.put("/:id", EnsureAuthenticationMiddleware.handle, UpdateJobController.handle);
jobsRouter.delete("/:id", EnsureAuthenticationMiddleware.handle, DeleteJobController.handle);

export { jobsRouter };
