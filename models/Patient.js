import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
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
  address: {
    type: String,
    trim: true
  },
  idNumber: {
    type: String,
    trim: true
  },
  insuranceNumber: {
    type: String,
    trim: true
  },
  medicalHistory: [{
    date: Date,
    diagnosis: String,
    treatment: String,
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    notes: String
  }],
  allergies: [{
    type: String
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Patient = mongoose.model('Patient', patientSchema)

export default Patient
