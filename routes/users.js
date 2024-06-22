const express = require('express')
const { createUser, getUsers } = require('../controllers/user')
const { authenticateJWT } = require('../middlewares/authenticate')

const router = express.Router()

// create a user
router.post('/', createUser)

// get all users
router.get('/', authenticateJWT, getUsers)

// // get a user
// router.get('/:id', getUser)

// // update a user
// router.put('/:id', updateUser)

// // delete a user
// router.delete('/:id', deleteUser)

module.exports = router
