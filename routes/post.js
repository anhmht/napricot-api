const express = require('express')
const {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost
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

// deletePost
router.delete('/:id', authenticateJWT, authorize, deletePost)

module.exports = router
