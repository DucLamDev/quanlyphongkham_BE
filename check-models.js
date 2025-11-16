/**
 * Check available models using REST API
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

async function checkModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCZDwBRubPl39NIr9oydBYJf37Fjrd7vos'
    
    console.log('🔍 Checking available models via REST API...')
    console.log('API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5))
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.log('Error details:', errorText)
      return
    }
    
    const data = await response.json()
    
    if (data.models && data.models.length > 0) {
      console.log('\n✅ Available models:')
      data.models.forEach(model => {
        console.log(`- ${model.name}`)
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`  ✅ Supports generateContent`)
        }
      })
      
      // Find a working model for generateContent
      const workingModel = data.models.find(model => 
        model.supportedGenerationMethods && 
        model.supportedGenerationMethods.includes('generateContent')
      )
      
      if (workingModel) {
        console.log(`\n🎯 Recommended model: ${workingModel.name}`)
        console.log(`Use in code: '${workingModel.name.replace('models/', '')}'`)
      }
    } else {
      console.log('❌ No models found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkModels()
