const express = require('express')
const { createContact } = require('../controllers/contact')

const router = express.Router()

// create a contact
router.post('/', createContact)

module.exports = router
