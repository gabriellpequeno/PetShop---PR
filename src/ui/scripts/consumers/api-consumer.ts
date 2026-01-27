export class ApiConsumer {
  protected static readonly BASE_URL: string = 'http://localhost:3333/api'

  protected static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }
}