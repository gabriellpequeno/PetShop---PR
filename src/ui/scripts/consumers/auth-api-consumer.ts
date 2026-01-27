import { ApiConsumer } from './api-consumer'

export class AuthApiConsumer extends ApiConsumer {
  async loginUser(email: string, password: string) {
    return fetch(`${AuthApiConsumer.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    })
  }

  async registerUser(name: string, email: string, password: string) {
    return fetch(`${AuthApiConsumer.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    })
  }
}