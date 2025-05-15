import express from 'express'
// Import controller
import { clearCloudflareCached } from '../controllers/slack'

const router = express.Router()

// purge Cloudflare cache
router.post('/cloudflare/purge', clearCloudflareCached)

export default router
