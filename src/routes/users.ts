import express from 'express'
// Import controllers
import {
  createUser,
  getUsers,
  resendVerificationCode,
  verifyUser,
  getMe,
  sendResetPasswordLink,
  resetPassword
} from '../controllers/user'

// Import middleware
import { authenticateJWT } from '../middlewares/authenticate'

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

// send reset password email
router.post('/send-reset-password-link', sendResetPasswordLink)

// reset password
router.post('/reset-password', resetPassword)

// Commented routes
// router.get('/:id', getUser)
// router.put('/:id', updateUser)
// router.delete('/:id', deleteUser)

export default router
