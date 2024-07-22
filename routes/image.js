const express = require('express')
const {
  uploadImage,
  moveAndGetLink,
  deleteDropboxImages,
  moveImagesToDeletedFolder
} = require('../controllers/dropbox')

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

// move Image
router.post('/move', moveAndGetLink)

// delete Image
router.post('/delete', deleteDropboxImages)

// move Images to Deleted Folder
router.post('/move-to-deleted-folder', moveImagesToDeletedFolder)

module.exports = router
