const express = require('express')
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/category')
const { authenticateJWT } = require('../middlewares/authenticate')
const { authorize } = require('../middlewares/authorize')

const router = express.Router()

// create a category
router.post('/', authenticateJWT, authorize, createCategory)

// get all categories
router.get('/', getCategories)

// update a category
router.put('/:id', authenticateJWT, authorize, updateCategory)

// delete a category
router.delete('/:id', authenticateJWT, authorize, deleteCategory)

module.exports = router
