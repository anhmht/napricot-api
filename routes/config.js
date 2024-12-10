const express = require('express')
const { deployFromWeb } = require('../controllers/heroku')

const router = express.Router()

// login
router.post('/deploy', deployFromWeb)

module.exports = router
