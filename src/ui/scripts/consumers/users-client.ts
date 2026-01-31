import { ApiConsumer } from './api-consumer'

export class UsersClient extends ApiConsumer {
  async getProfile() {
    const response = await fetch(`${ApiConsumer.BASE_URL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  }

  async updateProfile(data: {
    name?: string
    phone?: string
    location?: string
    birth_date?: string
  }) {
    const response = await fetch(`${ApiConsumer.BASE_URL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    return true
  }
}
