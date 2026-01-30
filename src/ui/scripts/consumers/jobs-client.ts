export class JobsClient {
  private baseUrl = '/api/jobs';

  async listServices() {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }

    return response.json();
  }

  async createService(data: {
    name: string;
    description: string;
    priceP: number;
    priceM: number;
    priceG: number;
    duration: number;
  }) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create service');
    }

    return response.json();
  }

  async updateService(
    id: string,
    data: {
      name?: string;
      description?: string;
      priceP?: number;
      priceM?: number;
      priceG?: number;
      duration?: number;
    }
  ) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update service');
    }

    return response.json();
  }

  async deleteService(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete service');
    }

    // DELETE usually returns 204 No Content
    if (response.status === 204) {
      return;
    }

    return response.json();
  }
}
