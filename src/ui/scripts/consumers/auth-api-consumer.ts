import { ApiConsumer } from './api-consumer'

export class AuthApiConsumer extends ApiConsumer {
  async loginUser(email: string, password: string) {
    return fetch(`${AuthApiConsumer.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
  }
}