import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'closed'],
    default: 'pending'
  },
  answer: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const Question = mongoose.model('Question', questionSchema)

export default Question
