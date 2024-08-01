const express = require('express')
const { createPaymentIntent } = require('../controllers/stripe')

const router = express.Router()

// create a payment intent
router.post('/create-payment-intent', createPaymentIntent)

module.exports = router
