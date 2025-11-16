import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import Doctor from '../models/Doctor.js'
import Equipment from '../models/Equipment.js'

dotenv.config()

class ChatbotService {
  constructor() {
    this.openai = null
    this.gemini = null
    this.initialize()
  }

  initialize() {
    try {
      // Initialize OpenAI if available
      const openaiKey = process.env.OPENAI_API_KEY
      if (openaiKey) {
        this.openai = new OpenAI({ apiKey: openaiKey })
        console.log('✅ OpenAI chatbot service initialized')
      }

      // Initialize Gemini (Free tier)
      const geminiKey = process.env.GEMINI_API_KEY
      if (geminiKey) {
        this.gemini = new GoogleGenerativeAI(geminiKey)
        console.log('✅ Gemini AI service initialized')
      } else {
        console.warn('⚠️ Gemini API key not configured')
      }
    } catch (error) {
      console.error('❌ AI initialization error:', error.message)
    }
  }

  includesKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword))
  }

  async getResponse(message) {
    const normalized = message.toLowerCase()

    // Try to answer based on database first
    const dataDrivenResponse = await this.getDataDrivenResponse(normalized)
    if (dataDrivenResponse) {
      return dataDrivenResponse
    }

    // Fall back to AI models for general questions
    // Try Gemini first (free tier), then OpenAI, then rule-based
    if (this.gemini) {
      const geminiResponse = await this.getGeminiResponse(message)
      if (geminiResponse) return geminiResponse
    }
    
    if (this.openai) {
      const llmResponse = await this.getLLMResponse(message)
      if (llmResponse) return llmResponse
    }

    // Finally, use rule-based reply
    return this.getRuleBasedResponse(message)
  }

  async getDataDrivenResponse(message) {
    if (this.includesKeywords(message, ['bác sĩ', 'bác sỹ', 'doctor', 'bs', 'chuyên gia'])) {
      return await this.composeDoctorsOverview()
    }

    if (this.includesKeywords(message, ['chuyên khoa', 'khoa', 'dịch vụ', 'service'])) {
      return await this.composeSpecialtyOverview()
    }

    if (this.includesKeywords(message, ['thiết bị', 'máy móc', 'công nghệ', 'equipment'])) {
      return await this.composeEquipmentOverview()
    }

    if (this.includesKeywords(message, ['giờ làm việc', 'mở cửa', 'đóng cửa', 'time'])) {
      return 'Phòng khám làm việc tất cả các ngày trong tuần từ 7:00 đến 20:00. Bộ phận cấp cứu luôn sẵn sàng hỗ trợ 24/7.'
    }

    if (this.includesKeywords(message, ['địa chỉ', 'ở đâu', 'map', 'vị trí'])) {
      return 'Phòng Khám Minh Giang đặt tại Khu đô thị Pom La, Thành phố Điện Biên Phủ. Bạn có thể đến trực tiếp hoặc gọi hotline 037 845 6839 để được hướng dẫn đường đi.'
    }

    if (this.includesKeywords(message, ['đặt lịch', 'hẹn khám', 'appointment', 'book'])) {
      return 'Bạn có thể đặt lịch khám trực tuyến ngay trên website ở mục "Đặt lịch khám" hoặc gọi hotline 037 845 6839. Chúng tôi sẽ xác nhận và nhắc lịch cho bạn trong thời gian sớm nhất.'
    }

    if (this.includesKeywords(message, ['bảo hiểm', 'insurance'])) {
      return 'Phòng khám hiện chấp nhận bảo hiểm của các đối tác như Blue Cross, Manulife, Allianz, AXA, Pacific Cross, AIG và FWD. Đừng quên mang theo thẻ bảo hiểm khi đến khám nhé!'
    }

    if (this.includesKeywords(message, ['giá', 'chi phí', 'bảng giá', 'bao nhiêu'])) {
      return 'Chi phí phụ thuộc vào dịch vụ và bác sĩ mà bạn chọn. Vui lòng cung cấp thêm nhu cầu cụ thể hoặc để lại số điện thoại, chúng tôi sẽ gọi lại tư vấn chi tiết nhất cho bạn.'
    }

    return null
  }

  async composeDoctorsOverview() {
    try {
      const doctors = await Doctor.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean()

      if (!doctors.length) {
        return 'Hiện chúng tôi chưa cập nhật danh sách bác sĩ trên hệ thống, nhưng luôn có đội ngũ bác sĩ giàu kinh nghiệm túc trực tại phòng khám. Bạn hãy để lại thông tin để được tư vấn phù hợp nhé.'
      }

      const lines = doctors.map((doctor) => {
        const experience = doctor.experience ? ` - ${doctor.experience}` : ''
        return `• BS. ${doctor.name} (${doctor.specialty}${experience})`
      })

      return [
        'Đội ngũ bác sĩ tại Phòng Khám Minh Giang đang phục vụ các chuyên khoa nổi bật:',
        ...lines,
        '',
        'Bạn muốn đặt lịch với bác sĩ nào? Tôi có thể hỗ trợ ghi nhận thông tin giúp bạn.'
      ].join('\n')
    } catch (error) {
      console.error('❌ composeDoctorsOverview error:', error.message)
      return null
    }
  }

  async composeSpecialtyOverview() {
    try {
      const specialties = await Doctor.distinct('specialty', { isActive: true })
      if (!specialties.length) {
        return 'Chúng tôi tiếp nhận khám tổng quát, sản phụ khoa, tim mạch, nhi, tai mũi họng và nhiều chuyên khoa khác. Bạn cần tư vấn thêm về chuyên khoa nào?'
      }

      return `Hiện phòng khám phục vụ các chuyên khoa: ${specialties.join(', ')}. Bạn có thể đặt lịch trực tuyến hoặc gọi 037 845 6839 để được tư vấn chọn chuyên khoa phù hợp.`
    } catch (error) {
      console.error('❌ composeSpecialtyOverview error:', error.message)
      return null
    }
  }

  async composeEquipmentOverview() {
    try {
      const equipment = await Equipment.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()

      if (!equipment.length) {
        return 'Phòng khám thường xuyên đầu tư nâng cấp hệ thống chẩn đoán hình ảnh, xét nghiệm và phẫu thuật. Bạn có thể đến trực tiếp để trải nghiệm trang thiết bị mới nhất của chúng tôi.'
      }

      const lines = equipment.map((item) => {
        const manufacturer = item.manufacturer ? ` - ${item.manufacturer}` : ''
        return `• ${item.name}${manufacturer} (${item.status === 'operational' ? 'đang hoạt động' : 'trạng thái: ' + item.status})`
      })

      return [
        'Một số thiết bị nổi bật đang phục vụ bệnh nhân:',
        ...lines,
        '',
        'Chúng tôi luôn bảo trì định kỳ để đảm bảo kết quả chẩn đoán chính xác nhất.'
      ].join('\n')
    } catch (error) {
      console.error('❌ composeEquipmentOverview error:', error.message)
      return null
    }
  }

  async getGeminiResponse(message) {
    try {
      const knowledge = await this.buildKnowledgeSnapshot()
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' })
      
      const prompt = `Bạn là trợ lý ảo của Phòng Khám Đa Khoa Minh Giang tại Điện Biên Phủ.
Thông tin phòng khám:
${knowledge}

Hãy trả lời câu hỏi sau một cách thân thiện, súc tích (không quá 150 từ):
${message}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return text.trim()
    } catch (error) {
      console.error('❌ Gemini API error:', error.message)
      return null
    }
  }

  async getLLMResponse(message) {
    try {
      const knowledge = await this.buildKnowledgeSnapshot()
      const systemPrompt = `
Bạn là trợ lý ảo của Phòng Khám Đa Khoa Minh Giang tại Điện Biên Phủ.
Luôn trả lời thân thiện, súc tích và dựa trên dữ liệu bên dưới nếu có:
${knowledge}
`.trim()

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 220,
        temperature: 0.6,
      })

      return response.choices[0].message.content.trim()
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message)
      return null
    }
  }

  async buildKnowledgeSnapshot() {
    try {
      const [doctors, specialties, equipment] = await Promise.all([
        Doctor.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).lean(),
        Doctor.distinct('specialty', { isActive: true }),
        Equipment.find({ isActive: true }).sort({ createdAt: -1 }).limit(3).lean()
      ])

      const doctorSummary = doctors.map(doc => `${doc.name} - ${doc.specialty}`).join('; ') || 'Chưa có dữ liệu bác sĩ.'
      const specialtySummary = specialties.join(', ') || 'Chưa cập nhật chuyên khoa.'
      const equipmentSummary = equipment.map(eq => `${eq.name} (${eq.status})`).join('; ') || 'Chưa có dữ liệu thiết bị.'

      return `
Bác sĩ: ${doctorSummary}
Chuyên khoa: ${specialtySummary}
Thiết bị: ${equipmentSummary}
Hotline: 037 845 6839
Địa chỉ: Khu đô thị Pom La, TP Điện Biên Phủ
Giờ làm việc: 7:00 - 20:00 (T2-CN)
      `.trim()
    } catch (error) {
      console.error('❌ buildKnowledgeSnapshot error:', error.message)
      return 'Không lấy được dữ liệu. Hãy trả lời chung chung nhưng hữu ích.'
    }
  }

  getRuleBasedResponse(message) {
    const lowerMessage = message.toLowerCase()

    if (this.includesKeywords(lowerMessage, ['xin chào', 'chào', 'hello', 'hi'])) {
      return 'Xin chào! Tôi là trợ lý của Phòng Khám Minh Giang. Bạn cần hỗ trợ đặt lịch, tư vấn bác sĩ hay hỏi về dịch vụ nào?'
    }

    if (this.includesKeywords(lowerMessage, ['số điện thoại', 'hotline', 'liên hệ'])) {
      return 'Bạn có thể liên hệ với chúng tôi qua hotline 037 845 6839 hoặc điền form đặt câu hỏi trên website, đội ngũ tư vấn sẽ liên lạc ngay.'
    }

    if (this.includesKeywords(lowerMessage, ['dịch vụ', 'khám gì', 'chữa gì'])) {
      return 'Phòng khám cung cấp khám tổng quát, sản phụ khoa, tim mạch, nhi, tai mũi họng, răng hàm mặt, xét nghiệm, chẩn đoán hình ảnh và tư vấn sức khỏe. Bạn quan tâm tới dịch vụ nào để tôi hỗ trợ chi tiết hơn?'
    }

    return 'Cảm ơn bạn đã nhắn tin! Bạn vui lòng mô tả rõ nhu cầu (ví dụ: đặt lịch, hỏi bác sĩ, chi phí...) để tôi hỗ trợ chính xác nhất, hoặc gọi nhanh 037 845 6839 nếu cần gấp nhé.'
  }
}

export default new ChatbotService()
