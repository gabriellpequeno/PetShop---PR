import { AppError } from "./app-error"

export class InternalServerError extends AppError {
  constructor(message: string) {
    super('Internal Server Error', message, 500)
  }
}