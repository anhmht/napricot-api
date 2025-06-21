import express from 'express'
// Import controller
import { createPaymentIntent } from '../controllers/stripe'

const router = express.Router()

// create a payment intent
router.post('/create-payment-intent', createPaymentIntent)

export default router
