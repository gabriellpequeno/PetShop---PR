export class AppError extends Error {
  constructor(
    readonly title: string,
    readonly message: string,
    readonly statusCode: number,
  ) {
    super(message)
  }
}
