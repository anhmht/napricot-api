const express = require('express')
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContacts,
  updateContacts
} = require('../controllers/contact')
const { authenticateJWT } = require('../middlewares/authenticate')
const { authorize } = require('../middlewares/authorize')

const router = express.Router()

// create a contact
router.post('/', createContact)

// get all contacts
router.get('/', authenticateJWT, authorize, getContacts)

// get a contact
router.get('/:id', authenticateJWT, authorize, getContact)

// update a contact
router.put('/:id', authenticateJWT, authorize, updateContact)

// delete multiple contacts
router.delete('/', authenticateJWT, authorize, deleteContacts)

// update multiple contacts
router.put('/', authenticateJWT, authorize, updateContacts)

module.exports = router
