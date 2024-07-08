const express = require('express')
const {
  uploadImage,
  moveAndGetLink,
  deleteDropboxImages
} = require('../controllers/dropbox')

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

// move Image
router.post('/move', moveAndGetLink)

// delete Image
router.post('/delete', deleteDropboxImages)

module.exports = router
