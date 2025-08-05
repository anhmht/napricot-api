import express from 'express'
// Import controllers
import { uploadImage } from '../controllers/imageController'

const router = express.Router()

// uploadImage
router.post('/upload', uploadImage)

export default router
