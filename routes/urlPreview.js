const express = require('express')
const { getUrlPreview } = require('../controllers/urlPreview')

const router = express.Router()

// Get URL preview
router.get('/get-preview-link', getUrlPreview)

module.exports = router
