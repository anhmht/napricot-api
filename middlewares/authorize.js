const authorize = (req, res, next) => {
  if (!res.locals.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!res.locals.user.isVerified) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!res.locals.user.roles.includes('admin')) {
    return res.status(401).json({ error: 'Not Permitted' })
  }
  next()
}

module.exports = { authorize }
