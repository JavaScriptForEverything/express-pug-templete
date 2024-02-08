const { catchAsync, appError } = require('./errorController')
const tokenService = require('../services/tokenService')
const userService = require('../services/userService')
const userDto = require('../dtos/userDto')

// GET 	/api/auth/refresh-token
exports.refreshToken = catchAsync(async (req, res, next) => {

	// Step-1: connect refreshToken from cookie
	const { refreshToken: refreshTokenFromCookie } = req.cookies
	if( !refreshTokenFromCookie ) return next(appError('plsease login ', 404, 'TokenError'))

	// Step-2: verify Token
	const { token, error } = await tokenService.verifyRefreshToken(refreshTokenFromCookie)
	if(error) return next(appError('refreshToken varification failed', 401, 'TokenError'))

	const userId = token._id


	// Step-4: check refreshToken in database, because in logout time token also will be deleted
	const findToken = tokenService.findRefreshToken(userId )
	if( !findToken ) return next(appError('plsease login ', 400, 'TokenError'))

	// Step-5: generate both tokens again
	const { accessToken, refreshToken } = await tokenService.generateTokens({ _id: userId })
	if(!accessToken) return next(appError('token generation failed', 400, 'TokenError'))

	// Step-6: set both tokens into cookie again
	res.cookie('accessToken', accessToken, {
		maxAge: 1000 * 60 * 60 * 24 * 30, 				// expres require new Date(), but maxAge just value
		httpOnly: true
	})
	res.cookie('refreshToken', refreshToken, {
		maxAge: 1000 * 60 * 60 * 24 * 30,
		httpOnly: true
	})

	// Step-7: update user token with newly created token
	const updatedToken = await tokenService.updateRefreshToken(refreshToken, userId )
	if(!updatedToken) return next(appError('replace token failed', 400, 'TokenError'))

	// Step-8: Send user as response: which will be used for auto-fetch on page-refresh
	const user = await userService.findUser({ _id: userId })
	
	res.status(200).json({
		status: 'success', 
		message: 'token refresh successfull',
		data: {
			user: userDto.filterUser(user._doc)
		}
	})
})