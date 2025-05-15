import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

interface AppError extends Error {
  statusCode?: number
  status?: string
}

const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err.statusCode ?? res.statusCode) || 500

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  })
}

export default errorHandler
