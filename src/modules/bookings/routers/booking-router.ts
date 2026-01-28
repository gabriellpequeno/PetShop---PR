import { Router } from "express";
import { CreateBookingController } from "../controllers/create-booking-controller";
import { ListBookingsController } from "../controllers/list-bookings-controller";
import { CancelBookingController } from "../controllers/cancel-booking-controller";
import { CompleteBookingController } from "../controllers/complete-booking-controller";

const bookingRouter = Router();

bookingRouter.post("/", CreateBookingController.handle);
bookingRouter.get("/", ListBookingsController.handle);
bookingRouter.patch("/:id/cancel", CancelBookingController.handle);
bookingRouter.patch("/:id/complete", CompleteBookingController.handle);

export { bookingRouter };
