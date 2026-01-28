import { Router } from "express";
import { BookingController } from "../controllers/booking-controller";

const bookingRouter = Router();

bookingRouter.post("/", BookingController.create);
bookingRouter.get("/", BookingController.list);
bookingRouter.patch("/:id/cancel", BookingController.cancel);
bookingRouter.patch("/:id/complete", BookingController.complete);

export { bookingRouter };
