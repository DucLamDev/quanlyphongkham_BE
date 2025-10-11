import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config()

class SMSService {
  constructor() {
    this.client = null
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER
    this.initialize()
  }

  initialize() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN

      if (!accountSid || !authToken || !this.phoneNumber) {
        console.warn('⚠️ Twilio credentials not configured')
        return
      }

      this.client = twilio(accountSid, authToken)
      console.log('✅ Twilio SMS service initialized')
    } catch (error) {
      console.error('❌ Twilio initialization error:', error.message)
    }
  }

  async sendAppointmentConfirmation(phone, appointmentData) {
    if (!this.client) {
      console.warn('⚠️ SMS service not configured, skipping send')
      return { success: false, message: 'SMS service not configured' }
    }

    try {
      // Format phone number for Vietnam (+84)
      const formattedPhone = phone.startsWith('0') 
        ? `+84${phone.substring(1)}` 
        : phone

      const message = `
Xin chào ${appointmentData.fullName}!

Phòng Khám Minh Giang xác nhận lịch khám của bạn:
📅 Ngày: ${new Date(appointmentData.appointmentDate).toLocaleDateString('vi-VN')}
🕐 Giờ: ${appointmentData.appointmentTime}
🏥 Chuyên khoa: ${appointmentData.specialty}

Vui lòng đến đúng giờ. Hotline: 037 845 6839

Trân trọng,
Phòng Khám Đa Khoa Minh Giang
      `.trim()

      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedPhone,
      })

      console.log('✅ SMS sent successfully:', response.sid)
      return { success: true, messageSid: response.sid }
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message)
      return { success: false, error: error.message }
    }
  }

  async sendQuestionConfirmation(phone, fullName) {
    if (!this.client) {
      console.warn('⚠️ SMS service not configured, skipping send')
      return { success: false, message: 'SMS service not configured' }
    }

    try {
      const formattedPhone = phone.startsWith('0') 
        ? `+84${phone.substring(1)}` 
        : phone

      const message = `
Xin chào ${fullName}!

Câu hỏi của bạn đã được gửi đến Phòng Khám Minh Giang. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.

Hotline: 037 845 6839

Trân trọng!
      `.trim()

      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedPhone,
      })

      console.log('✅ SMS sent successfully:', response.sid)
      return { success: true, messageSid: response.sid }
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message)
      return { success: false, error: error.message }
    }
  }
}

export default new SMSService()
