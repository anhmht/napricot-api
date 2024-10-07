const express = require('express')
const {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost,
  deletePosts,
  getPostBySlug
} = require('../controllers/post')
const { authenticateJWT } = require('../middlewares/authenticate')
const { authorize } = require('../middlewares/authorize')

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

module.exports = router
