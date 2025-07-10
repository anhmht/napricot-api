import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../schema/User'

interface JwtPayload {
  userId: string
  password: string
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.auth_token
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Verify the JWT token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload

  const user = await User.findOne({ _id: decoded.userId })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.locals.user = {
    userId: user._id as string,
    email: user.email,
    roles: user.roles,
    name: user.name,
    isVerified: user.isVerified
  }

  next()
}
