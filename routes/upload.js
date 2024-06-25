const express = require('express')
const { uploadImage } = require('../controllers/dropbox')

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

module.exports = router
