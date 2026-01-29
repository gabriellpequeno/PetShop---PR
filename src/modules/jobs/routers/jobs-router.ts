import { Router } from "express";
import { CreateJobController } from "../controllers/create-job-controller";
import { ListJobsController } from "../controllers/list-jobs-controller";
import { UpdateJobController } from "../controllers/update-job-controller";
import { DeleteJobController } from "../controllers/delete-job-controller";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
import { EnsureAdminMiddleware } from "@/middlewares/ensure-admin-middleware";

const jobsRouter = Router();

jobsRouter.post("/api/jobs", EnsureAuthenticationMiddleware.handle, CreateJobController.handle);
jobsRouter.get("/api/jobs", EnsureAuthenticationMiddleware.handle, ListJobsController.handle);
jobsRouter.put("/api/jobs/:id", EnsureAuthenticationMiddleware.handle, UpdateJobController.handle);
jobsRouter.delete("/api/jobs/:id", EnsureAuthenticationMiddleware.handle, DeleteJobController.handle);

export { jobsRouter }; 
