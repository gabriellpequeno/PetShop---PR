import { ApiConsumer } from './api-consumer.js'

export interface Booking {
  id: string
  userId: string
  petId: string
  jobId: string
  bookingDate: string
  status: string
}

export interface BookingCreateDTO {
  petId: string
  jobId: string
  bookingDate: string
}

export class BookingsClient extends ApiConsumer {
  async createBooking(data: BookingCreateDTO): Promise<Booking> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Falha ao criar agendamento')
    }

    return response.json()
  }

  async listUserBookings(): Promise<Booking[]> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Falha ao carregar agendamentos')
    }

    return response.json()
  }

  async cancelBooking(id: string): Promise<void> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Falha ao cancelar agendamento')
    }
  }
}
