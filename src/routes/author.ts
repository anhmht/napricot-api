import express from 'express'
import {
  createAuthor,
  updateAuthor,
  getAuthors,
  getAuthor,
  getAuthorBySlug,
  deleteAuthors
} from '../controllers/authorController'
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

const router = express.Router()

// createAuthor
router.post('/', authenticateJWT, authorize, createAuthor)

// updateAuthor
router.put('/:id', authenticateJWT, authorize, updateAuthor)

// getAuthors
router.get('/', authenticateJWT, authorize, getAuthors)

// getAuthor
router.get('/:id', authenticateJWT, authorize, getAuthor)

// getAuthorBySlug
router.get('/slug/:slug', getAuthorBySlug)

// deleteAuthors
router.delete('/', authenticateJWT, authorize, deleteAuthors)

export default router
