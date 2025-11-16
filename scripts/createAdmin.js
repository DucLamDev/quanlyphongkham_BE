import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Admin from '../models/Admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('✅ MongoDB connected')

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      process.exit(0)
    }

    // Create default admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
      fullName: 'Administrator',
      email: 'admin@phongkhamminggiang.vn',
      role: 'admin'
    })

    console.log('✅ Default admin created successfully')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('⚠️  Please change the password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createDefaultAdmin()
