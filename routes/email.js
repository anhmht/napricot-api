const express = require('express')
const { sendMail } = require('../controllers/email')

const router = express.Router()

// sendMail
router.post('/send', sendMail)

module.exports = router
