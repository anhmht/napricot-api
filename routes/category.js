const express = require('express')
const { createCategory, getCategories } = require('../controllers/category')
const { authenticateJWT } = require('../middlewares/authenticate')

const router = express.Router()

// create a category
router.post('/', authenticateJWT, createCategory)

// get all categories
router.get('/', getCategories)

module.exports = router
