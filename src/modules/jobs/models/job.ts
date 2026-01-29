export interface Job {
    id: string;
    name: string;
    description: string;
    priceP: number;
    priceM: number;
    priceG: number;
    duration: number;
}

export interface CreateJobData {
    name: string;
    description?: string;
    priceP: number;
    priceM: number;
    priceG: number;
    duration: number;
}

export interface UpdateJobData {
    name?: string;
    description?: string;
    priceP?: number;
    priceM?: number;
    priceG?: number;
    duration?: number;
}
