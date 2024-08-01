const express = require('express')
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/category')
const { authenticateJWT } = require('../middlewares/authenticate')

const router = express.Router()

// create a category
router.post('/', authenticateJWT, createCategory)

// get all categories
router.get('/', getCategories)

// update a category
router.put('/:id', authenticateJWT, updateCategory)

// delete a category
router.delete('/:id', authenticateJWT, deleteCategory)

module.exports = router
