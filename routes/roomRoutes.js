const { Router } = require('express')
const authController = require('../controllers/authController')
const roomController = require('../controllers/roomController')

// /api/rooms
const router = Router()

router.post('/', authController.auth, roomController.create)
router.get('/', authController.auth, roomController.getRooms)

module.exports = router