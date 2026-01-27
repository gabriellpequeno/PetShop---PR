import { UserRole } from "./User.js";


export interface IPet {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    userId: string;
}


export interface IPetCreate extends Omit<IPet, "id"> { }

export interface IPetUpdate {
    id: string;
    name?: string;
    species?: string;
    breed?: string;
    age?: number;
}