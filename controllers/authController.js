const { catchAsync, appError } = require('./errorController')
const otpService = require('../services/otpService')
const hashService = require('../services/hashService')
const userService = require('../services/userService')
const tokenService = require('../services/tokenService')
const fileService = require('../services/fileService')
const userDto = require('../dtos/userDto')

exports.auth = catchAsync(async (req, res, next) => {
	const { accessToken } = req.cookies
	if(!accessToken) return next(appError('please login first', 404, 'TokenError'))

	const { token, error } = await tokenService.verifyAccessToken(accessToken)
	if(error) return next(appError('accessToken expires', 401, 'TokenError'))

	req.userId = token._id
	
	next()
})

// POST 	/api/auth/send-otp 
/* We can store hashed otp in database:
		. store into database is reduce complexity
		. send user both otp and hashedOTP + expires date  + phone number: when need to varify get from user again.
*/
exports.sendOTP = catchAsync( async(req, res, next) => {
	const { phone } = req.body
	if(!phone) return next(appError('you must send: `phone` property '))

	// Step-1: 
	const otp = await otpService.generateOTP()

	/* Step-2: To send user otp and hashedOtp too, so that no need to store 
						into database, and later get hashedOtp back from client to validate
	*/
	const ttl = 1000 * 60 * 50 						// => TTL = Time To Live
	const expires = Date.now() + ttl
	const data = `${phone}.${otp}.${expires}`
	const hashedOtp = await hashService.hashOTP(data)

	// Step-3: 
	/*
	try {
		await otpService.sendSMS() 				// get twilio details first

	} catch (error) {
		return next(appError(error.message, 'OTP_error'))		
	}
	*/

	res.status(200).json({
		status: 'success',
		data: {
			message: `an message is send to you via SMS: ${otp}`, 	// don't send OTP here (for testing only)
			phone,
			hash: `${hashedOtp}.${expires}`, 												// send phone, expires + hashedOTP which will be require later
		}
	})
})


// POST 	/api/auth/verify-otp 
exports.verifyOTP = catchAsync( async (req, res, next) => {
	const { phone, otp, hash } = req.body

	if(!phone || !otp || !hash) return next(appError('you must send: { phone, otp, hash: hashedOTP }'))

	// step-1: check expires
	const [ hashedOTP, expires ] = hash.split('.')

	const isValidHashed = expires > Date.now()
	if(!isValidHashed) return next(appError('your OTP expires, please collect new OTP', 401, 'TokenError'))

	// step-2: check hashed hash
	const data = `${phone}.${otp}.${expires}` 			// get the same pattern from send otp
	const isValid = await hashService.validateOTP(data, hashedOTP)
	if(!isValid) return next(appError('hashed otp violated'))

	// step-3: Create user
	let user = null
	user = await userService.findUser({ phone })
	if(!user) {
		user = await userService.createUser({ phone })
		if(!user) return next(appError('userCreate failed'))
	}

	const userId = user._id

	// step-4: Generate token
	const payload = { _id: userId, }
	const { accessToken, refreshToken } = await tokenService.generateTokens(payload)

	// step-5: store token into database
	const token = await tokenService.findRefreshToken(userId)
	if(token) {
		tokenService.updateRefreshToken(refreshToken, userId)
	} else {
		const storedRefreshToken = await tokenService.storeRefreshToken(refreshToken, userId)
		if(!storedRefreshToken) return next(appError('string refreshToken failed', 401, 'TokenError'))
	}


	// step-6: Store both token into cookie which is HTTPS only : To prevent any XSS attach
	res.cookie('accessToken', accessToken, {
		maxAge: 1000 * 60 * 60 * 24 * 30, 				// expres require new Date(), but maxAge just value
		httpOnly: true
	})
	res.cookie('refreshToken', refreshToken, {
		maxAge: 1000 * 60 * 60 * 24 * 30,
		httpOnly: true
	})

	res.status(200).json({
		status: 'success',
		data: {
			message: 'your registration is success',
			isAuth: true, 														// To indicate client that auth success
			// user
			user: userDto.filterUser(user._doc)
		},
	})
})

// PATCH 	/api/auth/active-user + auth
exports.activeUser = catchAsync(async (req, res, next) => {
	const { name, avatar } = req.body
	if(!name || !avatar) return next(appError('missing fields: [name,avatar]'))

	const { error, url } = await fileService.handleBase64File(avatar)
	if(error) return next(appError(error))

	const userId = req.userId
	const user = await userService.activeUser(userId, { name, avatar: url, isActive: true })
	if(!user) return next(appError('update user failed'))

	res.status(201).json({
		status: 'success', 
		data: {
			user: userDto.filterUser(user._doc)
		}
	})
})


// Get 	/api/auth/logout + auth
exports.logout = catchAsync(async (req, res, next) => {
	const userId = req.userId
	if(!userId) return next(appError('only logedIn user can logout'))

	// Step-1: delete user's refreshToken by userId
	const tokenDoc = await tokenService.deleteRefreshToken(userId)
	if(!tokenDoc) return next(appError('delete refreshToken failed'))

	// Step-2: remove cookies: accessToken, refreshToken
	res.clearCookie('accessToken')
	res.clearCookie('refreshToken')

	res.status(201).json({
		status: 'success', 
		data: {
		}
	})
})
