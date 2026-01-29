import { Router } from "express";
import { join } from "node:path";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
import { EnsureAdminMiddleware } from "@/middlewares/ensure-admin-middleware";
import { UI_STATIC_PATH } from "@/constants/ui-static-path";

const jobsPageRouter = Router();

jobsPageRouter.get(
  "/admin/services",
  EnsureAuthenticationMiddleware.handle,
  EnsureAdminMiddleware.handle,
  (_, res) => {
    res.sendFile(join(UI_STATIC_PATH, "pages", "admin-services.html"));
  }
);

export { jobsPageRouter };