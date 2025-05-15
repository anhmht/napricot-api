import { Request, Response, NextFunction } from 'express'
import User from '../schema/User'
import { getMissingFields } from '../utils'
import { hashPassword, comparePassword } from '../utils/password'
import { sendMail } from '../utils/email'
import { getDigitalCode } from 'node-verification-code'
import jwt from 'jsonwebtoken'

interface MailParams {
  key: string
  value: string
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body

    const missingField = getMissingFields(req.body, [
      'name',
      'email',
      'password'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    // check if user already exists
    const isUserExists = await User.findOne({ email })

    if (isUserExists) {
      res.status(404).json({
        error: true,
        message: 'User already exists'
      })
      return next(new Error('User already exists'))
    }

    const verificationCode = getDigitalCode(6).toString()

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      verifyCode: await hashPassword(verificationCode)
    })

    let token: string
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          roles: user.roles,
          password: user.password
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '10 years' }
      )
    } catch (err) {
      const error = new Error('Error! Something went wrong.')
      res.status(500).json({
        message: 'Error! Something went wrong.',
        err
      })
      return next(error)
    }

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [email],
      subject: 'Verify your Napricot account',
      template: 'email-verification.html',
      params: [
        {
          key: 'name',
          value: name
        },
        {
          key: 'code',
          value: verificationCode
        },
        {
          key: 'link',
          value: `${process.env.FRONTEND_URL}/email-verification?token=${token}`
        }
      ]
    })

    res.status(200).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      token
    })
  } catch (error) {
    return next(error)
  }
}

const resendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body

    const missingField = getMissingFields(req.body, ['email'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    // check if user already exists
    const user = await User.findOne({ email })

    if (!user) {
      res.status(404).json({
        error: true,
        message: 'User does not exists'
      })
      return next(new Error('User does not exists'))
    }

    const verificationCode = getDigitalCode(6).toString()

    await User.findByIdAndUpdate(
      user._id,
      {
        verifyCode: await hashPassword(verificationCode)
      },
      { new: true }
    )

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [email],
      subject: 'Verify your Napricot account',
      template: 'email-verification.html',
      params: [
        {
          key: 'name',
          value: user.name
        },
        {
          key: 'code',
          value: verificationCode
        }
      ]
    })

    res.status(200).json({
      message: 'Verification code sent successfully'
    })
  } catch (error) {
    return next(error)
  }
}

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body

    const missingField = getMissingFields(req.body, ['email', 'code'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const user = await User.findOne({ email })

    if (!user) {
      res.status(404).json({
        error: true,
        message: 'User does not exists'
      })
      return next(new Error('User does not exists'))
    }

    const isCodeMatch = await comparePassword(code, user.verifyCode || '')

    if (!isCodeMatch) {
      res.status(400).json({
        error: true,
        message: 'Invalid verification code'
      })
      return next(new Error('Invalid verification code'))
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        isVerified: true
      },
      { new: true }
    )

    res.status(200).json({
      message: 'User verified successfully'
    })
  } catch (error) {
    return next(error)
  }
}

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      ...res.locals.user
    })
  } catch (error) {
    return next(error)
  }
}

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = new Date()
    const users = await User.find()
    const b = new Date()
    console.log('Time taken to get users:', b.getTime() - a.getTime())

    res.status(200).json({
      users
    })
  } catch (error) {
    return next(error)
  }
}

const sendResetPasswordLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body

    const missingField = getMissingFields(req.body, ['email'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const user = await User.findOne({ email })

    if (!user) {
      res.status(404).json({
        error: true,
        message: 'User does not exists'
      })
      return next(new Error('User does not exists'))
    }

    let token: string
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          roles: user.roles,
          password: user.password
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '10 years' }
      )
    } catch (err) {
      const error = new Error('Error! Something went wrong.')
      res.status(500).json({
        message: 'Error! Something went wrong.',
        err
      })
      return next(error)
    }

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [email],
      subject: 'Reset your Napricot account password',
      template: 'reset-password.html',
      params: [
        {
          key: 'name',
          value: user.name
        },
        {
          key: 'link',
          value: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        }
      ]
    })

    res.status(200).json({
      message: 'Reset code sent successfully'
    })
  } catch (error) {
    return next(error)
  }
}

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body

    const missingField = getMissingFields(req.body, ['password'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const token = req.header('Authorization')

    if (!token) {
      res.status(400).json({
        error: true,
        message: 'Token is required'
      })
      return next(new Error('Token is required'))
    }

    jwt.verify(
      token.split(' ')[1],
      process.env.JWT_SECRET as string,
      async (err, decoded: any) => {
        if (err) {
          res.status(403).json({
            error: true,
            message: 'Forbidden'
          })
          return next(new Error('Forbidden'))
        }

        const user = await User.findById(decoded.userId)

        if (!user) {
          res.status(404).json({
            error: true,
            message: 'User does not exists'
          })
          return next(new Error('User does not exists'))
        }

        if (user.password !== decoded.password) {
          res.status(400).json({
            error: true,
            message: 'Invalid token'
          })
          return next(new Error('Invalid token'))
        }

        await User.findByIdAndUpdate(
          user._id,
          {
            password: await hashPassword(password)
          },
          { new: true }
        )
        res.status(200).json({
          message: 'Password reset successfully'
        })
      }
    )
  } catch (error) {
    return next(error)
  }
}

export {
  createUser,
  getUsers,
  resendVerificationCode,
  verifyUser,
  getMe,
  sendResetPasswordLink,
  resetPassword
}
