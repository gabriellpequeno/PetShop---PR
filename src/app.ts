import express from "express";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import { TranspileScriptMiddleware } from "./middlewares/transpile-script-middleware";
import { HandleErrorMiddleware } from "./middlewares/handle-error-middleware";
import { UI_STATIC_PATH } from "./constants/ui-static-path";
import { authRouter } from "./modules/auth/routers/auth-router";
import { EnsureAuthenticationMiddleware } from "./middlewares/ensure-authentication-middleware";
import { jobsRouter } from "./modules/jobs/routers/jobs-router";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(UI_STATIC_PATH));

app.get(/^\/scripts\/(.+)\.js$/, TranspileScriptMiddleware.handle);

app.use(authRouter);
app.use("/jobs", jobsRouter);

app.get("/", EnsureAuthenticationMiddleware.handle, (_, res) => {
  res.sendFile(join(UI_STATIC_PATH, "pages", "home.html"));
});

app.use(HandleErrorMiddleware.handle);

export { app };
