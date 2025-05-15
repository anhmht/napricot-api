import express from 'express'
// Import controllers
import {
  uploadImage,
  moveAndGetLink,
  deleteDropboxImages,
  moveImagesToDeletedFolder
} from '../controllers/dropbox'

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

// move Image
router.post('/move', moveAndGetLink)

// delete Image
router.post('/delete', deleteDropboxImages)

// move Images to Deleted Folder
router.post('/move-to-deleted-folder', moveImagesToDeletedFolder)

export default router
