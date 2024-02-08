






const path = require('path')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const express = require('express')
const cookieParser = require('cookie-parser')


const pageRouter = require('./routes/pageRoutes')
const userRouter = require('./routes/userRoutes')
const authRouter = require('./routes/authRoutes')
const fileRouter = require('./routes/fileRoutes')
const roomRouter = require('./routes/roomRoutes')

const errorController = require('./controllers/errorController')


const publicDirectory = path.join(process.cwd(), 'public')
const app = express()

app.use(cookieParser())
// app.use(cors({ 
// 	origin: ['http://localhost:3000'],
// 	credentials: true, 			// if fetch(url, { ... credentials: 'include' })
// }))
app.use(express.json({ limit: '3mb' })) 	// req.body json parse

app.set('view engine', 'pug')
app.use(express.static( publicDirectory ))

// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 10);
	})

	app.use(connectLivereload()) 													// for reload browser
}


app.use('/', pageRouter)
app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/rooms', roomRouter)
app.use('/upload/*', fileRouter)


app.use(errorController.errorHandler)
app.all('*', errorController.pageNotFound)

module.exports = app