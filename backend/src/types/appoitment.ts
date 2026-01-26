export interface Iappointment {
    appointmentId: string;
    userId: string;
    serviceId: string;
    petId: string;
    price: number;
    date: string;
    time: string;
    status: string;
}

export interface IappointmentUpdate {
    appointmentId?: string;
    userId?: string;
    serviceId?: string;
    petId?: string;
    price?: number;
    date?: string;
    time?: string;
    status?: string;
} 