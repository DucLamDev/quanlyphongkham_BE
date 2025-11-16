import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Voucher from '../models/Voucher.js'

dotenv.config()

const vouchers = [
  {
    code: 'KHAM10',
    discountPercent: 10,
    description: 'Giảm 10% chi phí khám bệnh',
    expiryDate: new Date('2025-12-31'),
    maxUses: null, // Unlimited
    isActive: true
  },
  {
    code: 'KHAM20',
    discountPercent: 20,
    description: 'Giảm 20% chi phí khám bệnh - Khách hàng VIP',
    expiryDate: new Date('2025-12-31'),
    maxUses: 100,
    isActive: true
  },
  {
    code: 'WELCOME15',
    discountPercent: 15,
    description: 'Giảm 15% cho khách hàng mới',
    expiryDate: new Date('2025-12-31'),
    maxUses: 500,
    isActive: true
  }
]

async function seedVouchers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Clear existing vouchers (optional)
    await Voucher.deleteMany({})
    console.log('🗑️  Cleared existing vouchers')

    // Insert vouchers
    const result = await Voucher.insertMany(vouchers)
    console.log(`✅ Successfully seeded ${result.length} vouchers:`)
    result.forEach(v => {
      console.log(`   - ${v.code}: ${v.discountPercent}% discount`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding vouchers:', error)
    process.exit(1)
  }
}

seedVouchers()
