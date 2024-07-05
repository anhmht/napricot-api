const express = require('express')
const { createPost, updatePost } = require('../controllers/post')

const router = express.Router()

// createPost
router.post('/', createPost)

// updatePost
router.put('/:id', updatePost)

module.exports = router
