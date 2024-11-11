const express = require('express')
const { authenticateJWT } = require('../middlewares/authenticate')
const { authorize } = require('../middlewares/authorize')
const {
  createLink,
  getLinks,
  getLink,
  updateLink,
  deleteLinks
} = require('../controllers/link')

const router = express.Router()

// create a link
router.post('/', authenticateJWT, authorize, createLink)

// get all Links
router.get('/', getLinks)

// get a link
router.get('/:id', authenticateJWT, authorize, getLink)

// update a link
router.put('/:id', authenticateJWT, authorize, updateLink)

// delete multiple categories
router.delete('/', authenticateJWT, authorize, deleteLinks)

module.exports = router
