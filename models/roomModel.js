const { Schema, models, model } = require('mongoose');

// topic,
// roomType,
// owner: req.userId
// speackers: [user._id]
const roomSchema = new Schema({
	topic: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		minlength: 7,
		maxlength: 150
	},
	roomType: {
		type: String,
		required: true,
		trim: true,
		enum: ['open', 'social', 'closed']
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	speakers: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	}],

}, { 
	timestamps: true
})

const Room = models.Room || model('Room', roomSchema)
module.exports = Room

