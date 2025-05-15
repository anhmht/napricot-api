import express from 'express'
// The controllers and middlewares will need to be converted to TypeScript later
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  deleteCategories
} from '../controllers/category'

// Import middlewares using ES modules syntax
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

const router = express.Router()

// create a category
router.post('/', authenticateJWT, authorize, createCategory)

// get all categories
router.get('/', getCategories)

// get a category
router.get('/:id', authenticateJWT, authorize, getCategory)

// update a category
router.put('/:id', authenticateJWT, authorize, updateCategory)

// delete a category
router.delete('/:id', authenticateJWT, authorize, deleteCategory)

// delete multiple categories
router.delete('/', authenticateJWT, authorize, deleteCategories)

export default router
