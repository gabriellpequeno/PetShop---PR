import { ApiConsumer } from './api-consumer.js'

export interface Booking {
  id: string
  userId: string
  petId: string
  jobId: string
  bookingDate: string
  bookingTime?: string
  status: 'agendado' | 'concluido' | 'cancelado'
  price: number
  realStartTime: string | null
  realEndTime: string | null
  createdAt: string
  petName?: string
  petSize?: 'P' | 'M' | 'G'
  jobName?: string
  jobDuration?: number
  userName?: string
}

export interface AdminBooking {
  id: string
  userId: string
  petId: string
  jobId: string
  bookingDate: string
  bookingTime?: string
  status: 'agendado' | 'concluido' | 'cancelado'
  price: number
  realStartTime: string | null
  realEndTime: string | null
  createdAt: string
  petName?: string
  petSize?: 'P' | 'M' | 'G'
  jobName?: string
  jobDuration?: number
  userName?: string
} 

export interface BookingCreateDTO {
  petId: string
  jobId: string
  bookingDate: string
  bookingTime?: string
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

  async listOccupiedSlots(startDate: string, endDate: string): Promise<{ bookingDate: string; bookingTime: string; jobId: string }[]> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings/occupied-slots?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Falha ao carregar slots ocupados')
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

  async listAllBookings(): Promise<AdminBooking[]> {
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

  async completeBooking(id: string): Promise<void> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings/${id}/complete`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Falha ao concluir agendamento')
    }
  }

  async reopenBooking(id: string): Promise<void> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/bookings/${id}/reopen`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Falha ao reabrir agendamento')
    }
  }
}
