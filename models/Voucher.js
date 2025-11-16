import mongoose from 'mongoose'

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  maxUses: {
    type: Number,
    default: null // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Method to check if voucher is valid
voucherSchema.methods.isValid = function() {
  const now = new Date()
  
  // Check if expired
  if (this.expiryDate < now) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn' }
  }
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Mã giảm giá không còn hiệu lực' }
  }
  
  // Check max uses
  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' }
  }
  
  return { valid: true, message: 'Mã giảm giá hợp lệ' }
}

const Voucher = mongoose.model('Voucher', voucherSchema)

export default Voucher
