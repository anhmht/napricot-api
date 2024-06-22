const jwt = require('jsonwebtoken')

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    console.log(user)
    next()
  })
}

module.exports = { authenticateJWT }
