/**
 * List available Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCZDwBRubPl39NIr9oydBYJf37Fjrd7vos'
    const genAI = new GoogleGenerativeAI(apiKey)
    
    console.log('🔍 Listing available Gemini models...\n')
    
    // Try different model names that are commonly available
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.0-pro',
      'gemini-1.0-pro-latest'
    ]
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Hello')
        const response = await result.response
        const text = response.text()
        console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 50)}...`)
        console.log('─'.repeat(60))
        break // Stop at first working model
      } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.message.substring(0, 100)}...`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

listModels()
