require('dotenv').config()
const { createServer } = require('http')
const { Server } = require('socket.io')
const dbConnect = require('./models/dbConnect')
const socketController = require('./controllers/socketController')
const app = require('./app')

const httpServer = createServer(app)


const PORT = process.env.PORT || 5000
httpServer.listen(PORT, async () => {

	await dbConnect()

	const io = new Server(httpServer, { cors: {
		origin: process.env.CLIENT_ORIGIN,
		methods: ['GET', 'POST']
	}})

	io.on('connection', socketController(io))


	console.log(`server listen on: http://localhost:${PORT}`)
})