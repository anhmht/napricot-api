import express from 'express'
// Import controller
import { getUrlPreview } from '../controllers/urlPreview'

const router = express.Router()

// Get URL preview
router.get('/get-preview-link', getUrlPreview)

export default router
