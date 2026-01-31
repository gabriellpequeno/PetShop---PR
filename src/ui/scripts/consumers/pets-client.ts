import { ApiConsumer } from './api-consumer';

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  weight?: number
  size: 'P' | 'M' | 'G'
  userId: string
}

export class PetsClient extends ApiConsumer {
  async listPets() {
    const response = await fetch(`${ApiConsumer.BASE_URL}/pets`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }
    
    return response.json();
  }

  async createPet(data: any) {
    const response = await fetch(`${ApiConsumer.BASE_URL}/pets`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create pet');
    }

    return response.json();
  }

  async deletePet(id: string) {
    const response = await fetch(`${ApiConsumer.BASE_URL}/pets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete pet');
    }

    return true; // No content usually
  }
}
