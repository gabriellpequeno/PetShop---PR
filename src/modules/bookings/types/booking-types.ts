export interface IBooking {
    id: string;
    userId: string;
    petId: string;
    jobId: string;
    bookingDate: string;
    status: "agendado" | "concluido" | "cancelado";
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
}

export interface IBookingResponse extends IBooking {
    petName?: string;
    jobName?: string;
    userName?: string;
}
