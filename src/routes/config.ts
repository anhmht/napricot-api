import express from 'express'
// Import controller
import { deployFromWeb } from '../controllers/heroku'

const router = express.Router()

// Deploy from web
router.post('/deploy', deployFromWeb)

export default router
