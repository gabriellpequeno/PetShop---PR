import { ApiConsumer } from './api-consumer'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  birth_date?: string
  created_at?: string
}

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  owner_id: string
  image_url?: string
}

export class AdminUsersClient extends ApiConsumer {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    return response.json()
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(email: string): Promise<User[]> {
    const response = await fetch(
      `${ApiConsumer.BASE_URL}/admin/users/search?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search users')
    }

    return response.json()
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  /**
   * Update user (admin only)
   */
  async updateUser(
    userId: string,
    data: {
      name?: string | undefined
      email?: string | undefined
      phone?: string | undefined
      location?: string | undefined
      birth_date?: string | undefined
    }
  ): Promise<boolean> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    return true
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<boolean> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    return true
  }

  /**
   * Get pets for a specific user (admin only)
   */
  async getUserPets(userId: string): Promise<Pet[]> {
    const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users/${userId}/pets`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user pets')
    }

    return response.json()
  }

  /**
   * Get bookings for a specific user (admin only)
   */
  async getUserBookings(userId: string): Promise<any[]> {
    const response = await fetch(
      `${ApiConsumer.BASE_URL}/bookings?userId=${userId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch user bookings')
    }

    return response.json()
  }
}
