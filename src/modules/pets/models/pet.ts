export interface Pet {
    id: string;
    userId: string;
    name: string;
    species: string;
    breed: string | null;
    weight: number | null;
    age: number | null;
}