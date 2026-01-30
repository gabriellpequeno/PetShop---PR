export interface IBooking {
    id: string;
    userId: string;
    petId: string;
    jobId: string;
    bookingDate: string;
    bookingTime: string;
    status: "agendado" | "concluido" | "cancelado";
    price: number;
    realStartTime: string | null;
    realEndTime: string | null;
    createdAt: string;
}

export interface IBookingCreate {
    userId: string;
    userRole: string;
    petId: string;
    jobId: string;
    bookingDate: string;
    bookingTime: string;
}

export interface IBookingResponse extends IBooking {
    petName?: string;
    petSize?: 'P' | 'M' | 'G';
    jobName?: string;
    jobDuration?: number;
    userName?: string;
}
