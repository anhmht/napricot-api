import express from 'express'
import {
  createAuthor,
  updateAuthor,
  getAuthors,
  getAuthor,
  getAuthorBySlug
} from '../controllers/authorController'
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

const router = express.Router()

// createAuthor
router.post('/', authenticateJWT, authorize, createAuthor)

// updateAuthor
router.put('/:id', authenticateJWT, authorize, updateAuthor)

// getAuthors
router.get('/', getAuthors)

// getAuthor
router.get('/:id', getAuthor)

// getAuthorBySlug
router.get('/slug/:slug', getAuthorBySlug)

export default router
