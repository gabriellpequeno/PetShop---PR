
import { BASE_URL } from '@/constants/base-url'

export class ApiConsumer {
  protected static readonly BASE_URL: string = `${BASE_URL}/api`

  protected getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }
}