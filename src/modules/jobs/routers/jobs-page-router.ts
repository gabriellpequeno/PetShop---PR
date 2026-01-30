import { Router } from "express";

import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
import { EnsureAdminMiddleware } from "@/middlewares/ensure-admin-middleware";
import { HtmlRenderer } from "@/utils/html-renderer";

const jobsPageRouter = Router();

jobsPageRouter.get(
  "/admin/services",
  EnsureAuthenticationMiddleware.handle,
  EnsureAdminMiddleware.handle,
  (_, res) => {
    HtmlRenderer.render(res, "jobs.html");
  }
);

export { jobsPageRouter };