import { UpdateJobController } from "../controllers/update-job-controller";
import { DeleteJobController } from "../controllers/delete-job-controller";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
import { EnsureAdminMiddleware } from "@/middlewares/ensure-admin-middleware";
import { Router } from "express";
import { CreateJobController } from "../controllers/create-job-controller";
import { ListJobsController } from "../controllers/list-jobs-controller";
import { ListAvailableJobsController } from "../controllers/list-available-jobs-controller";

const jobsRouter = Router();

jobsRouter.get("/api/jobs/available", EnsureAuthenticationMiddleware.handle, ListAvailableJobsController.handle);
jobsRouter.post("/api/jobs", EnsureAuthenticationMiddleware.handle, EnsureAdminMiddleware.handle, CreateJobController.handle);
jobsRouter.get("/api/jobs", EnsureAuthenticationMiddleware.handle, ListJobsController.handle);
jobsRouter.put("/api/jobs/:id", EnsureAuthenticationMiddleware.handle, EnsureAdminMiddleware.handle, UpdateJobController.handle);
jobsRouter.delete("/api/jobs/:id", EnsureAuthenticationMiddleware.handle, EnsureAdminMiddleware.handle, DeleteJobController.handle);

export { jobsRouter }; 