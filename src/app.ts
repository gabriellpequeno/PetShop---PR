import express from 'express'
import cookieParser from 'cookie-parser'
import { TranspileScriptMiddleware } from './middlewares/transpile-script-middleware'
import { HandleErrorMiddleware } from './middlewares/handle-error-middleware'
import { UI_STATIC_PATH } from './constants/ui-static-path'

// Routers
import { petsPageRouter } from './modules/pets/routers/pets-page-router'
import { usersPageRouter } from './modules/users/routers/users-page-router'
import { adminUsersPageRouter } from './modules/users/routers/admin-users-page-router'
import { customerDashboardRouter } from './modules/home/routers/customer-dashboard-router'

// API Routers
import { authRouter } from './modules/auth/routers/auth-router'
import { usersRouter } from './modules/users/routers/users-router'
import { adminUsersRouter } from './modules/users/routers/admin-users-router'
import { petsRouter } from './modules/pets/routers/pets-router'
import { homeRouter } from './modules/home/routers/home-router'
import { jobsRouter } from "./modules/jobs/routers/jobs-router";
import { jobsPageRouter } from './modules/jobs/routers/jobs-page-router'
import { bookingRouter } from "./modules/bookings/routers/booking-router";
import { adminRouter } from "./modules/admin/routers/admin-router";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(UI_STATIC_PATH));

app.get(/^\/scripts\/(.+)\.js$/, TranspileScriptMiddleware.handle);

app.use(petsPageRouter)
app.use(usersPageRouter)
app.use(adminUsersPageRouter)
app.use(jobsPageRouter)
app.use(customerDashboardRouter)

app.use(authRouter)
app.use(homeRouter)
app.use(jobsRouter)
app.use(bookingRouter)
app.use(petsRouter)
app.use(usersRouter)
app.use(adminRouter)
app.use(adminUsersRouter)

app.use(HandleErrorMiddleware.handle);

export { app };