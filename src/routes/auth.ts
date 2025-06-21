import express from 'express'
// Import from the TypeScript version
import { login } from '../controllers/auth'

const router = express.Router()

// login
router.post('/login', login)

export default router
