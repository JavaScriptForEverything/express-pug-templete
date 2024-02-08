const Room = require('../models/roomModel')

exports.create = (payload) => {
	return Room.create(payload)
}
exports.getRooms = (types) => {
	return Room.find({ roomType: { $in: types }})
}