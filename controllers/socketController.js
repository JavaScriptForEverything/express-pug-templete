let connectedPeers = []
let rooms = []


module.exports = (io) => (socket) => {
	socket.on('user-join', ({ socketId, userId }) => {
		if(!userId) return sendError(socket, { message: 'userId is missing' })

		connectedPeers.push({ socketId, userId })
		socket.join(userId)

		console.log(connectedPeers)

	})


	socket.on('disconnect', () => {
		connectedPeers = connectedPeers.filter(({ socketId }) => socketId !== socket.id )
		console.log(connectedPeers)
	})
}


const sendError = (socket, { message, reason='' }) => {
	socket.emit('error', {
		message,
		reason,
	})
}

