const express = require('express')
const {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost
} = require('../controllers/post')

const router = express.Router()

// createPost
router.post('/', createPost)

// updatePost
router.put('/:id', updatePost)

// getPosts
router.get('/', getPosts)

// getPost
router.get('/:id', getPost)

// deletePost
router.delete('/:id', deletePost)

module.exports = router
