import { db } from "@/database/db";
import { randomUUID } from "node:crypto";
import type { Job, JobAvailability, CreateJobData, UpdateJobData } from "../models/job";

export class JobsRepository {
    async create(data: CreateJobData): Promise<Job> {
        const id = randomUUID();
        const description = data.description ?? "";

        await db.run(
            "INSERT INTO jobs (id, name, description, priceP, priceM, priceG, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, data.name, description, data.priceP, data.priceM, data.priceG, data.duration]
        );

        // Insert availability if provided
        if (data.availability && data.availability.length > 0) {
            for (const avail of data.availability) {
                const availId = randomUUID();
                await db.run(
                    "INSERT INTO job_availability (id, jobId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?, ?)",
                    [availId, id, avail.dayOfWeek, avail.startTime, avail.endTime]
                );
            }
        }

        const availability = await this.getAvailabilityByJobId(id);

        return {
            id,
            name: data.name,
            description,
            priceP: data.priceP,
            priceM: data.priceM,
            priceG: data.priceG,
            duration: data.duration,
            availability,
        };
    }

    async findById(id: string): Promise<Job | undefined> {
        const job = await db.get<Job>("SELECT * FROM jobs WHERE id = ?", [id]);
        if (job) {
            job.availability = await this.getAvailabilityByJobId(id);
        }
        return job;
    }

    async findByName(name: string): Promise<Job | undefined> {
        const job = await db.get<Job>("SELECT id FROM jobs WHERE name = ?", [name]);
        return job;
    }

    async findAll(): Promise<Job[]> {
        const jobs = await db.all<Job[]>("SELECT * FROM jobs");
        
        // Load availability for each job
        for (const job of jobs) {
            job.availability = await this.getAvailabilityByJobId(job.id);
        }
        
        return jobs;
    }

    async update(id: string, data: UpdateJobData & { id: string }, existingJob: Job): Promise<Job> {
        const updatedName = data.name !== undefined ? data.name : existingJob.name;
        const updatedDescription = data.description !== undefined ? data.description : existingJob.description;
        const updatedPriceP = data.priceP !== undefined ? data.priceP : existingJob.priceP;
        const updatedPriceM = data.priceM !== undefined ? data.priceM : existingJob.priceM;
        const updatedPriceG = data.priceG !== undefined ? data.priceG : existingJob.priceG;
        const updatedDuration = data.duration !== undefined ? data.duration : existingJob.duration;

        await db.run(
            `UPDATE jobs SET name = ?, description = ?, priceP = ?, priceM = ?, priceG = ?, duration = ? WHERE id = ?`,
            [updatedName, updatedDescription, updatedPriceP, updatedPriceM, updatedPriceG, updatedDuration, id]
        );

        // Update availability if provided
        if (data.availability !== undefined) {
            // Delete existing availability
            await db.run("DELETE FROM job_availability WHERE jobId = ?", [id]);
            
            // Insert new availability
            for (const avail of data.availability) {
                const availId = randomUUID();
                await db.run(
                    "INSERT INTO job_availability (id, jobId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?, ?)",
                    [availId, id, avail.dayOfWeek, avail.startTime, avail.endTime]
                );
            }
        }

        const availability = await this.getAvailabilityByJobId(id);

        return {
            id,
            name: updatedName,
            description: updatedDescription,
            priceP: updatedPriceP,
            priceM: updatedPriceM,
            priceG: updatedPriceG,
            duration: updatedDuration,
            availability,
        };
    }

    async delete(id: string): Promise<void> {
        // Delete availability first (cascade should handle this but being explicit)
        await db.run("DELETE FROM job_availability WHERE jobId = ?", [id]);
        await db.run("DELETE FROM jobs WHERE id = ?", [id]);
    }

    async getAvailabilityByJobId(jobId: string): Promise<JobAvailability[]> {
        const availability = await db.all<JobAvailability[]>(
            "SELECT * FROM job_availability WHERE jobId = ? ORDER BY dayOfWeek, startTime",
            [jobId]
        );
        return availability;
    }

    async getAvailableJobsForDateTime(date: string, time: string): Promise<Job[]> {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        const jobs = await db.all<Job[]>(`
            SELECT DISTINCT j.* FROM jobs j
            INNER JOIN job_availability ja ON j.id = ja.jobId
            WHERE ja.dayOfWeek = ? 
            AND ja.startTime <= ? 
            AND ja.endTime > ?
        `, [dayOfWeek, time, time]);

        for (const job of jobs) {
            job.availability = await this.getAvailabilityByJobId(job.id);
        }

        return jobs;
    }
}
