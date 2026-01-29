import { ApiConsumer } from './api-consumer.js'

export interface Job {
  id: string
  name: string
  description: string
  priceP: number
  priceM: number
  priceG: number
  duration: number
}

export class JobsClient extends ApiConsumer {
  async listJobs(): Promise<Job[]> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/jobs`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Falha ao carregar serviços')
    }

    return response.json()
  }
}
