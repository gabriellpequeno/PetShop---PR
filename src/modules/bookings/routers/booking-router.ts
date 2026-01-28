import { Router } from "express";
import { CreateBookingController } from "../controllers/create-booking-controller";
import { ListBookingsController } from "../controllers/list-bookings-controller";
import { CancelBookingController } from "../controllers/cancel-booking-controller";
import { CompleteBookingController } from "../controllers/complete-booking-controller";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
const bookingRouter = Router();

bookingRouter.post("/", EnsureAuthenticationMiddleware.handle, CreateBookingController.handle);
bookingRouter.get("/", EnsureAuthenticationMiddleware.handle, ListBookingsController.handle);
bookingRouter.patch("/:id/cancel", EnsureAuthenticationMiddleware.handle, CancelBookingController.handle);
bookingRouter.patch("/:id/complete", EnsureAuthenticationMiddleware.handle, CompleteBookingController.handle);

export { bookingRouter };
