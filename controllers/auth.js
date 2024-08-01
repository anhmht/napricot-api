const User = require('../models/User')
const jwt = require('jsonwebtoken')

const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const existingUser = await User.findOne({ email: email })
    if (!existingUser || existingUser.password != password) {
      const error = Error('Wrong details please check at once')
      return next(error)
    }

    let token
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '' }
      )
    } catch (err) {
      console.log(err)
      const error = new Error('Error! Something went wrong.')
      return next(error)
    }

    res.status(200).json({
      data: {
        userId: existingUser.id,
        email: existingUser.email,
        token: token
      }
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  login
}
