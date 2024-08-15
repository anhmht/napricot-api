const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { comparePassword } = require('../utils/password')

const login = async (req, res, next) => {
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

    let token
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.email,
          roles: existingUser.roles,
          password: existingUser.password
        },
        process.env.JWT_SECRET,
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

module.exports = {
  login
}
