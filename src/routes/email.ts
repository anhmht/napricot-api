import express from 'express'
// Import from the TypeScript version
import { sendMail } from '../controllers/email'

const router = express.Router()

// sendMail
router.post('/send', sendMail)

export default router
