const jwt = require('jsonwebtoken')
const Token = require('../models/tokenModel')

const { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } = process.env

/* Why we need 2 different type of token ?
		- 
*/

exports.generateTokens = async (payload) => {
	const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
	const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1y' })

	return { accessToken, refreshToken }
}

exports.storeRefreshToken = async (refreshToken, userId) => {
	return await Token.create({ refreshToken, user: userId })
}

exports.findRefreshToken = async (userId) => {
	return Token.findOne({ user: userId })
}
exports.updateRefreshToken = async (refreshToken, userId) => {
	return Token.findOneAndUpdate({ user: userId }, { refreshToken })
}

exports.verifyAccessToken = async (accessToken) => {
	const tempObj = {}
	try {
		tempObj.token = jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET)
	} catch (error) {
		// if validation failed then if set statusCode 401, then axios.interceptors will fires
		tempObj.error = error.message
	}
	return tempObj
}
exports.verifyRefreshToken = async (refreshToken) => {
	const tempObj = {}
	try {
		tempObj.token = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET)
	} catch (error) {
		tempObj.error = error.message
	}
	return tempObj
}

exports.deleteRefreshToken = async (userId) => {
	return Token.deleteOne({ user: userId })
}