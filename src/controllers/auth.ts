import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { comparePassword } from '../utils/password'
import User from '../schema/User'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      res.status(404).json({
        message: 'Invalid email or password'
      })
      return next(new Error('Invalid email or password'))
    }

    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password
    )

    if (!isPasswordMatch) {
      res.status(404).json({
        message: 'Invalid email or password'
      })
      return next(new Error('Invalid email or password'))
    }

    let token: string
    try {
      // Creating jwt token
      token = jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.email,
          roles: existingUser.roles,
          password: existingUser.password
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '10 years',
          algorithm: 'HS256'
        }
      )
    } catch (err) {
      const error = new Error('Error! Something went wrong.')
      res.status(500).json({
        message: 'Error! Something went wrong.',
        err
      })
      return next(error)
    }

    res.status(200).json({
      user: {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        roles: existingUser.roles,
        token: token
      }
    })
  } catch (err) {
    res.status(500).json({
      message: 'Error! Something went wrong.',
      err
    })
    return next(err)
  }
}
