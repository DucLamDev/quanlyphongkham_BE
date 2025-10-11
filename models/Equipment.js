import mongoose from 'mongoose'

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thiết bị'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn loại thiết bị'],
    enum: ['diagnostic', 'treatment', 'surgical', 'monitoring', 'laboratory', 'other']
  },
  manufacturer: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true
  },
  purchaseDate: {
    type: Date
  },
  warrantyExpiry: {
    type: Date
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'repair', 'retired'],
    default: 'operational'
  },
  location: {
    type: String,
    trim: true
  },
  maintenanceSchedule: [{
    date: Date,
    type: String,
    performedBy: String,
    notes: String,
    nextMaintenanceDate: Date
  }],
  specifications: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  cost: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Equipment = mongoose.model('Equipment', equipmentSchema)

export default Equipment
