const { filterObjectByArray } = require('../utils')

exports.filterRoom = (room) => {
	const allowedFields = ['_id', 'topic', 'roomType', 'owner', 'speakers', 'createdAt']
	return filterObjectByArray(room, allowedFields)
}