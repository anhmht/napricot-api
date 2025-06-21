import express from 'express'
// Import middlewares
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

// Import controllers
import {
  createLink,
  getLinks,
  getLink,
  updateLink,
  deleteLinks
} from '../controllers/link'

const router = express.Router()

// create a link
router.post('/', authenticateJWT, authorize, createLink)

// get all Links
router.get('/', getLinks)

// get a link
router.get('/:id', authenticateJWT, authorize, getLink)

// update a link
router.put('/:id', authenticateJWT, authorize, updateLink)

// delete multiple links
router.delete('/', authenticateJWT, authorize, deleteLinks)

export default router
