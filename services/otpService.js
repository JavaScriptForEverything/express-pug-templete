const crypto = require('crypto')

const { SMS_SID='', SMS_SECRET='', SMS_FROM_NUMBER } = process.env
// const twilio = require('twilio')(SMS_SID, SMS_SECRET, { })

exports.generateOTP = async () => {
	return crypto.randomInt(1000, 9999)
}

exports.sendSMS = async (phone, otp) => {
	// return await twilio.messages.create({
	// 	to: phone,
	// 	from: SMS_FROM_NUMBER,
	// 	body: `your coderhouse otp: ${otp}`
	// })
}

