import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error'

export class HandleErrorMiddleware {
  static async handle(
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) {
    if (error instanceof AppError) {
      console.error('App Error:', error)
      return response
        .status(error.statusCode)
        .json({ title: error.title, error: error.message })
    }

    console.error('Unknown Error:', error)
    return response.status(500).json({ title: 'Unknown Error', error: error.message })
  }
}
