const User = require('../models/User')

const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      res.status(400)
      return next(new Error('name & email fields are required'))
    }

    // check if user already exists
    const isUserExists = await User.findOne({ email })

    if (isUserExists) {
      res.status(404)
      return next(new Error('User already exists'))
    }

    const user = await User.create({
      name,
      email
    })

    res.status(200).json({
      user
    })
  } catch (error) {
    return next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()

    res.status(200).json({
      users
    })
  } catch (error) {
    return next(error)
  }
}

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
        { expiresIn: '1h' }
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
  createUser,
  getUsers,
  login
}
