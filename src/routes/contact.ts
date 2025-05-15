import express from 'express'
// Import middlewares
import { authenticateJWT } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'

// Import controllers using ES modules
import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContacts,
  updateContacts
} from '../controllers/contact'

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

export default router
