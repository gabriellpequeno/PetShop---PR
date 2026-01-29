import { Router } from "express";
import { CreateBookingController } from "../controllers/create-booking-controller";
import { ListBookingsController } from "../controllers/list-bookings-controller";
import { CancelBookingController } from "../controllers/cancel-booking-controller";
import { CompleteBookingController } from "../controllers/complete-booking-controller";
import { RenderBookingPageController } from "../controllers/render-booking-page-controller";
import { EnsureAuthenticationMiddleware } from "@/middlewares/ensure-authentication-middleware";
const bookingRouter = Router();

bookingRouter.get("/pages/booking.html", EnsureAuthenticationMiddleware.handle, RenderBookingPageController.handle);
bookingRouter.post("/api/bookings", EnsureAuthenticationMiddleware.handle, CreateBookingController.handle);
bookingRouter.get("/api/bookings", EnsureAuthenticationMiddleware.handle, ListBookingsController.handle);
bookingRouter.patch("/api/bookings/:id/cancel", EnsureAuthenticationMiddleware.handle, CancelBookingController.handle);
bookingRouter.patch("/api/bookings/:id/complete", EnsureAuthenticationMiddleware.handle, CompleteBookingController.handle);

export { bookingRouter }; 
