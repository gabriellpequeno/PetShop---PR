export interface JobAvailability {
    id: string;
    jobId: string;
    dayOfWeek: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
    startTime: string; // Formato HH:MM
    endTime: string;   // Formato HH:MM
}

export interface Job {
    id: string;
    name: string;
    description: string;
    priceP: number;
    priceM: number;
    priceG: number;
    duration: number;
    availability?: JobAvailability[];
}

export interface CreateJobData {
    name: string;
    description?: string;
    priceP: number;
    priceM: number;
    priceG: number;
    duration: number;
    availability?: Omit<JobAvailability, 'id' | 'jobId'>[];
}

export interface UpdateJobData {
    name?: string;
    description?: string;
    priceP?: number;
    priceM?: number;
    priceG?: number;
    duration?: number;
    availability?: Omit<JobAvailability, 'id' | 'jobId'>[];
}
