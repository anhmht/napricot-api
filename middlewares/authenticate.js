const jwt = require('jsonwebtoken')

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  })
}

module.exports = { authenticateJWT }
