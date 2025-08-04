import express from 'express'
// The controllers and middlewares will need to be converted to TypeScript later
import {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost,
  deletePosts,
  getPostBySlug
} from '../controllers/postController'
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

const router = express.Router()

// createPost
router.post('/', authenticateJWT, authorize, createPost)

// updatePost
router.put('/:id', authenticateJWT, authorize, updatePost)

// getPosts
router.get('/', getPosts)

// getPost
router.get('/:id', getPost)

// getPostBySlug
router.get('/slug/:slug', getPostBySlug)

// deletePost
router.delete('/:id', authenticateJWT, authorize, deletePost)

// deletePosts
router.delete('/', authenticateJWT, authorize, deletePosts)

export default router
