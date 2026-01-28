import { db } from "@/database/db";
import { randomUUID } from "node:crypto";
import type { Job, CreateJobData, UpdateJobData } from "../models/job";

export class JobsRepository {
    async create(data: CreateJobData): Promise<Job> {
        const id = randomUUID();
        const description = data.description ?? "";

        await db.run(
            "INSERT INTO jobs (id, name, description, priceP, priceM, priceG, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, data.name, description, data.priceP, data.priceM, data.priceG, data.duration]
        );

        return {
            id,
            name: data.name,
            description,
            priceP: data.priceP,
            priceM: data.priceM,
            priceG: data.priceG,
            duration: data.duration,
        };
    }

    async findById(id: string): Promise<Job | undefined> {
        const job = await db.get<Job>("SELECT * FROM jobs WHERE id = ?", [id]);
        return job;
    }

    async findByName(name: string): Promise<Job | undefined> {
        const job = await db.get<Job>("SELECT id FROM jobs WHERE name = ?", [name]);
        return job;
    }

    async findAll(): Promise<Job[]> {
        const jobs = await db.all<Job[]>("SELECT * FROM jobs");
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

        return {
            id,
            name: updatedName,
            description: updatedDescription,
            priceP: updatedPriceP,
            priceM: updatedPriceM,
            priceG: updatedPriceG,
            duration: updatedDuration,
        };
    }

    async delete(id: string): Promise<void> {
        await db.run("DELETE FROM jobs WHERE id = ?", [id]);
    }
}
