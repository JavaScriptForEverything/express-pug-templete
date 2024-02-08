const roomService = require('../services/roomService')
const roomDto = require('../dtos/roomDto')
const { catchAsync } = require('./errorController')

// POST 	/api/rooms 	+ auth
exports.create = catchAsync(async (req, res, next) => {
	const { topic, roomType } = req.body
	const userId = req.userId

	const payload = {
		topic,
		roomType,
		owner: userId,
		speakers: [userId]
	}

	const room = await roomService.create(payload)

	res.status(200).json({
		status: 'success',
		data: {
			room: roomDto.filterRoom(room._doc)
		},
	})
})


// GET 	/api/rooms 	+ auth
exports.getRooms = catchAsync(async (req, res, next) => {

	const rooms = await roomService.getRooms(['open', 'social', 'closed'])
	.populate('owner speakers')
	const allRooms = rooms.map( room => roomDto.filterRoom(room._doc) )

	res.status(200).json({
		status: 'success',
		data: {
			count: allRooms.length,
			rooms: allRooms
		},
	})
})