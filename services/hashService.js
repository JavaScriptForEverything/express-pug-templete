const crypto = require('crypto')

const otpSecret = process.env.OTP_SECRET

exports.hashOTP = async (data) => {
	return crypto.createHmac('sha256', otpSecret).update(data).digest('base64')
}


exports.validateOTP = async (data, hash) => {
	const currentHash = crypto.createHmac('sha256', otpSecret).update(data).digest('base64')
	return currentHash === hash
}