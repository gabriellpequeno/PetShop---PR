import { AppError } from './app-error'

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super('Unauthorized', message, 401)
  }
}
