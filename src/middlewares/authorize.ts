import { Request, Response, NextFunction } from 'express'

// Define a custom interface to extend Express's Response.locals
declare global {
  namespace Express {
    interface Locals {
      user?: {
        userId: string
        email: string
        roles: string[]
        name: string
        isVerified: boolean
      }
    }
  }
}

export const authorize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!res.locals.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!res.locals.user.isVerified) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (
    !res.locals.user.roles.includes('admin') &&
    !res.locals.user.roles.includes('superadmin')
  ) {
    res.status(401).json({ error: 'Not Permitted' })
    return
  }

  next()
}
