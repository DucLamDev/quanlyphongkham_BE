import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

class ChatbotService {
  constructor() {
    this.openai = null
    this.initialize()
  }

  initialize() {
    try {
      const apiKey = process.env.OPENAI_API_KEY

      if (!apiKey) {
        console.warn('⚠️ OpenAI API key not configured')
        return
      }

      this.openai = new OpenAI({
        apiKey: apiKey,
      })
      console.log('✅ OpenAI chatbot service initialized')
    } catch (error) {
      console.error('❌ OpenAI initialization error:', error.message)
    }
  }

  async getResponse(message) {
    // If OpenAI is not configured, use simple rule-based responses
    if (!this.openai) {
      return this.getRuleBasedResponse(message)
    }

    try {
      const systemPrompt = `
Bạn là trợ lý ảo của Phòng Khám Đa Khoa Minh Giang tại Điện Biên Phủ.
Thông tin phòng khám:
- Địa chỉ: Khu đô thị Pom La, Điện Biên Phủ, Vietnam
- Hotline: 037 845 6839
- Giờ làm việc: Thứ 2 - Chủ nhật, 7:00 - 20:00
- Dịch vụ: Khám tổng quát, Sản phụ khoa, Tim mạch, Mắt, Xét nghiệm, Tiêm chủng, Chẩn đoán hình ảnh, Tư vấn sức khỏe
- Đối tác bảo hiểm: Blue Cross, Manulife, Allianz, AXA, Pacific Cross, AIG, FWD

Hãy trả lời các câu hỏi về phòng khám một cách thân thiện, chuyên nghiệp và ngắn gọn.
      `.trim()

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      return response.choices[0].message.content.trim()
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message)
      return this.getRuleBasedResponse(message)
    }
  }

  getRuleBasedResponse(message) {
    const lowerMessage = message.toLowerCase()

    // Greeting
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('chào') || lowerMessage.includes('hello')) {
      return 'Xin chào! Tôi là trợ lý ảo của Phòng Khám Minh Giang. Tôi có thể giúp gì cho bạn hôm nay?'
    }

    // Working hours
    if (lowerMessage.includes('giờ làm việc') || lowerMessage.includes('mở cửa') || lowerMessage.includes('đóng cửa')) {
      return 'Phòng khám làm việc từ Thứ 2 đến Chủ nhật, từ 7:00 sáng đến 20:00 tối. Bạn có thể đến khám bất kỳ ngày nào trong tuần.'
    }

    // Address
    if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('ở đâu') || lowerMessage.includes('vị trí')) {
      return 'Phòng khám tọa lạc tại Khu đô thị Pom La, Điện Biên Phủ, Vietnam. Bạn có thể gọi hotline 037 845 6839 để được hướng dẫn cụ thể.'
    }

    // Phone
    if (lowerMessage.includes('số điện thoại') || lowerMessage.includes('hotline') || lowerMessage.includes('liên hệ')) {
      return 'Bạn có thể liên hệ với chúng tôi qua hotline: 037 845 6839. Chúng tôi luôn sẵn sàng hỗ trợ bạn!'
    }

    // Services
    if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('khám gì') || lowerMessage.includes('chữa gì')) {
      return 'Phòng khám cung cấp các dịch vụ: Khám tổng quát, Sản phụ khoa, Tim mạch, Mắt, Xét nghiệm, Tiêm chủng, Chẩn đoán hình ảnh và Tư vấn sức khỏe. Bạn muốn biết thêm về dịch vụ nào?'
    }

    // Doctors
    if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('bác sỹ') || lowerMessage.includes('doctor')) {
      return 'Phòng khám có đội ngũ hơn 20 bác sĩ giàu kinh nghiệm, được đào tạo bài bản. Bạn có thể xem thông tin chi tiết trên website hoặc gọi hotline để được tư vấn.'
    }

    // Appointment
    if (lowerMessage.includes('đặt lịch') || lowerMessage.includes('hẹn khám') || lowerMessage.includes('book')) {
      return 'Bạn có thể đặt lịch khám trực tiếp trên website bằng cách điền form đặt lịch, hoặc gọi hotline 037 845 6839. Chúng tôi sẽ xác nhận lịch hẹn ngay.'
    }

    // Insurance
    if (lowerMessage.includes('bảo hiểm') || lowerMessage.includes('insurance')) {
      return 'Chúng tôi chấp nhận thanh toán bảo hiểm từ các đối tác: Blue Cross, Manulife, Allianz, AXA, Pacific Cross, AIG, FWD. Vui lòng mang theo thẻ bảo hiểm khi đến khám.'
    }

    // Price
    if (lowerMessage.includes('giá') || lowerMessage.includes('chi phí') || lowerMessage.includes('phí') || lowerMessage.includes('tiền')) {
      return 'Chi phí khám tùy thuộc vào dịch vụ bạn lựa chọn. Vui lòng gọi hotline 037 845 6839 hoặc điền form câu hỏi để được tư vấn chi tiết về chi phí.'
    }

    // Default response
    return 'Cảm ơn bạn đã liên hệ! Để được tư vấn chi tiết hơn, vui lòng gọi hotline 037 845 6839 hoặc điền form đặt câu hỏi trên website. Chúng tôi luôn sẵn sàng hỗ trợ bạn!'
  }
}

export default new ChatbotService()
