const express = require('express')
const { clearCloudflareCached } = require('../controllers/slack')

const router = express.Router()

// purge Cloudflare cache
router.post('/cloudflare/purge', clearCloudflareCached)

module.exports = router
