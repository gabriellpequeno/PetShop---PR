import type { Request, Response, NextFunction } from "express";
import { JobsRepository } from "../repositories/jobs-repository";

export class ListAvailableJobsController {
  static async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, time } = req.query;

      if (!date || !time) {
        res.status(400).json({ error: "Date and time are required" });
        return;
      }

      const dateStr = date as string;
      const timeStr = time as string;

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
        return;
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeStr)) {
        res.status(400).json({ error: "Invalid time format. Use HH:MM" });
        return;
      }

      const repository = new JobsRepository();
      const jobs = await repository.getAvailableJobsForDateTime(dateStr, timeStr);

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  }
}
