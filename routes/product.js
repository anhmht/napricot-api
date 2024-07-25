const express = require('express')

const {
  createProduct,
  updateProduct,
  getProducts,
  getProduct,
  deleteProduct
} = require('../controllers/product')

const { getAvailableVariants } = require('../controllers/printify')

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

module.exports = router
