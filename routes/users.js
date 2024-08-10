const express = require('express')
const {
  createUser,
  getUsers,
  resendVerificationCode,
  verifyUser,
  getMe
} = require('../controllers/user')
const { authenticateJWT } = require('../middlewares/authenticate')

const router = express.Router()

// create a user
router.post('/register', createUser)

// resend verification code
router.post('/resend', resendVerificationCode)

// verify user
router.post('/verify', verifyUser)

// get all users
router.get('/', authenticateJWT, getUsers)

// get me
router.get('/me', authenticateJWT, getMe)

// // get a user
// router.get('/:id', getUser)

// // update a user
// router.put('/:id', updateUser)

// // delete a user
// router.delete('/:id', deleteUser)

module.exports = router
