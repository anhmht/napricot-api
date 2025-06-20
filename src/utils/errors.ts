/**
 * Centralized error handling utilities
 * Provides custom error classes for better error classification and handling
 */

export class HttpError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403)
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}

export class ValidationError extends HttpError {
  field?: string

  constructor(message = 'Validation error', field?: string) {
    super(message, 400)
    this.field = field
  }
}

// Error handling middleware
import { Request, Response, NextFunction } from 'express'
import logger from './logger'

export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500
  const field = 'field' in err ? err.field : undefined

  logger.error(`${statusCode} error:`, err)

  const response: any = {
    error: true,
    message: err.message || 'Internal server error'
  }

  if (field) {
    response.field = field
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

export default {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  errorHandler
}
