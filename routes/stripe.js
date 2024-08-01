const express = require('express')
const { handleWebhook } = require('../controllers/stripe')

const router = express.Router()

// create a payment intent
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

module.exports = router
