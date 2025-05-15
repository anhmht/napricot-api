import express from 'express'
// The controllers will need to be converted to TypeScript later
import {
  createProduct,
  updateProduct,
  getProducts,
  getProduct,
  deleteProduct
} from '../controllers/product'

import { getAvailableVariants } from '../controllers/printify'

const router = express.Router()

// create product
router.post('/', createProduct)

// update product
router.put('/:id', updateProduct)

// get products
router.get('/', getProducts)

// get product
router.get('/:id', getProduct)

// delete product
router.delete('/:id', deleteProduct)

// get available printify variants
router.get('/printify/:provider/:blueprint', getAvailableVariants)

export default router
