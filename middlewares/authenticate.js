const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, info) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const user = await User.findOne({ email: info.email })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.password !== info.password) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.locals.user = {
      userId: user._id,
      email: user.email,
      roles: user.roles,
      name: user.name,
      isVerified: user.isVerified
    }
    next()
  })
}

module.exports = { authenticateJWT }
