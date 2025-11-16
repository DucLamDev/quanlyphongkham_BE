/**
 * Test Gemini API key validity
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function testApiKey() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCZDwBRubPl39NIr9oydBYJf37Fjrd7vos'
    
    console.log('🔑 Testing API Key...')
    console.log('API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5))
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try the most basic model names
    const basicModels = [
      'models/gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ]
    
    for (const modelName of basicModels) {
      try {
        console.log(`\n🧪 Testing: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const prompt = "Say hello in Vietnamese"
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ SUCCESS with ${modelName}`)
        console.log(`Response: ${text}`)
        
        // Update the chatbot service with working model
        console.log(`\n🔧 Use this model in chatbotService.js:`)
        console.log(`this.model = this.genAI.getGenerativeModel({ model: '${modelName}' })`)
        return modelName
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`)
      }
    }
    
    console.log('\n❌ No working models found. Possible issues:')
    console.log('1. API key might be invalid or expired')
    console.log('2. API key might not have access to Gemini models')
    console.log('3. Network/firewall issues')
    
  } catch (error) {
    console.error('❌ Critical error:', error.message)
  }
}

testApiKey()
