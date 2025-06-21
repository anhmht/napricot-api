import express from 'express'
// Import controller
import { handleWebhook } from '../controllers/stripe'

const router = express.Router()

// Handle Stripe webhook
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

export default router
