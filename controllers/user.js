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
    const a = new Date()
    const users = await User.find()
    const b = new Date()
    console.log('Time taken to get users:', b - a)

    res.status(200).json({
      users
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createUser,
  getUsers
}
