import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../schema/User'

interface JwtPayload {
  email: string
  password: string
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header('Authorization')

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  jwt.verify(
    token.split(' ')[1],
    process.env.JWT_SECRET as string,
    async (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        res.status(403).json({ error: 'Forbidden' })
        return
      }

      const info = decoded as JwtPayload
      const user = await User.findOne({ email: info.email })

      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      if (user.password !== info.password) {
        res.status(403).json({ error: 'Forbidden' })
        return
      }

      res.locals.user = {
        userId: user._id,
        email: user.email,
        roles: user.roles,
        name: user.name,
        isVerified: user.isVerified
      }

      next()
    }
  )
}
