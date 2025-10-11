import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
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
  specialty: {
    type: String,
    required: [true, 'Vui lòng chọn chuyên khoa']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày khám']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Vui lòng chọn giờ khám']
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const Appointment = mongoose.model('Appointment', appointmentSchema)

export default Appointment
