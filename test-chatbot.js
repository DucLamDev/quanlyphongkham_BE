/**
 * Test script for Gemini Chatbot
 * Run: node test-chatbot.js
 */

import chatbotService from './services/chatbotService.js'
import knowledgeBaseService from './services/knowledgeBaseService.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function testChatbot() {
  try {
    console.log('🧪 Testing Gemini Chatbot\n')

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected\n')

    // Wait for chatbot initialization
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test questions
    const testQuestions = [
      'Xin chào',
      'Phòng khám làm việc mấy giờ?',
      'Có bác sĩ nào chuyên khoa tim mạch không?',
      'Hiện có mã giảm giá nào không?',
      'Làm sao để đặt lịch khám?',
      'Chi phí khám bao nhiêu?'
    ]

    console.log('🤖 Testing chatbot responses:\n')

    for (const question of testQuestions) {
      console.log(`❓ Question: ${question}`)
      const response = await chatbotService.getResponse(question)
      console.log(`💬 Response: ${response}`)
      console.log('─'.repeat(80))
      console.log('')
    }

    // Test knowledge base
    console.log('📚 Testing knowledge base:\n')
    const knowledge = await knowledgeBaseService.buildKnowledgeBase()
    console.log('Knowledge Base Preview:')
    console.log(knowledge.substring(0, 500) + '...')
    console.log('')

    // Get basic info
    const basicInfo = knowledgeBaseService.getBasicInfo()
    console.log('📋 Basic Clinic Info:')
    console.log(JSON.stringify(basicInfo, null, 2))

    console.log('\n✅ All tests completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Test error:', error)
    process.exit(1)
  }
}

// Run tests
testChatbot()
