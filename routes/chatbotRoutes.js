import express from 'express'
import chatbotService from '../services/chatbotService.js'

const router = express.Router()

// Chat with bot
router.post('/', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      })
    }

    const reply = await chatbotService.getResponse(message)

    res.json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in chatbot:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
      reply: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng liên hệ hotline 037 845 6839 để được hỗ trợ.'
    })
  }
})

export default router
