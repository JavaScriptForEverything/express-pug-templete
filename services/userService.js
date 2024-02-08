const User = require('../models/userModel')

exports.findUser = (filter) => {
	return User.findOne(filter)
}
exports.createUser = (data) => {
	return User.create(data)
}

exports.activeUser = (userId, data) => {
	return User.findByIdAndUpdate(userId, data, { new: true })
}