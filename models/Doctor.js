import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên bác sĩ'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập chức danh'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Vui lòng nhập chuyên khoa'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Vui lòng nhập số năm kinh nghiệm']
  },
  image: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  education: {
    type: String,
    trim: true
  },
  certifications: [{
    type: String
  }],
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Doctor = mongoose.model('Doctor', doctorSchema)

export default Doctor
