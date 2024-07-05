const express = require('express')
const { uploadImage, moveAndGetLink } = require('../controllers/dropbox')

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

// move Image
router.post('/move', moveAndGetLink)

module.exports = router
