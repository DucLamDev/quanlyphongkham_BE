import express from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import Appointment from '../models/Appointment.js'
import Doctor from '../models/Doctor.js'
import Patient from '../models/Patient.js'
import Equipment from '../models/Equipment.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// ============ AUTH ROUTES ============

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      })
    }

    const admin = await Admin.findOne({ username })
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      })
    }

    const isMatch = await admin.comparePassword(password)
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      })
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    })
  }
})

// Get current admin
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  })
})

// ============ DASHBOARD STATS ============

router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalAppointments,
      pendingAppointments,
      totalPatients,
      totalDoctors,
      totalEquipment
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Equipment.countDocuments({ isActive: true })
    ])

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        totalPatients,
        totalDoctors,
        totalEquipment
      },
      recentAppointments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê',
      error: error.message
    })
  }
})

// ============ APPOINTMENT ROUTES ============

// Get all appointments
router.get('/appointments', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    
    const query = status ? { status } : {}
    
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Appointment.countDocuments(query)

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách lịch hẹn',
      error: error.message
    })
  }
})

// Update appointment status
router.patch('/appointments/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    res.json({
      success: true,
      appointment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái',
      error: error.message
    })
  }
})

// Delete appointment
router.delete('/appointments/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    res.json({
      success: true,
      message: 'Đã xóa lịch hẹn'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa lịch hẹn',
      error: error.message
    })
  }
})

// ============ DOCTOR ROUTES ============

// Get all doctors
router.get('/doctors', protect, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 })

    res.json({
      success: true,
      doctors
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bác sĩ',
      error: error.message
    })
  }
})

// Create doctor
router.post('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body)

    res.status(201).json({
      success: true,
      doctor
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo bác sĩ',
      error: error.message
    })
  }
})

// Update doctor
router.put('/doctors/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      })
    }

    res.json({
      success: true,
      doctor
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật bác sĩ',
      error: error.message
    })
  }
})

// Delete doctor
router.delete('/doctors/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id)

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      })
    }

    res.json({
      success: true,
      message: 'Đã xóa bác sĩ'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa bác sĩ',
      error: error.message
    })
  }
})

// ============ PATIENT ROUTES ============

// Get all patients
router.get('/patients', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    
    let query = {}
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Patient.countDocuments(query)

    res.json({
      success: true,
      patients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bệnh nhân',
      error: error.message
    })
  }
})

// Get single patient
router.get('/patients/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('medicalHistory.doctor')

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    res.json({
      success: true,
      patient
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin bệnh nhân',
      error: error.message
    })
  }
})

// Create patient
router.post('/patients', protect, async (req, res) => {
  try {
    const patient = await Patient.create(req.body)

    res.status(201).json({
      success: true,
      patient
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo bệnh nhân',
      error: error.message
    })
  }
})

// Update patient
router.put('/patients/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    res.json({
      success: true,
      patient
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật bệnh nhân',
      error: error.message
    })
  }
})

// Delete patient
router.delete('/patients/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id)

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    res.json({
      success: true,
      message: 'Đã xóa bệnh nhân'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa bệnh nhân',
      error: error.message
    })
  }
})

// ============ EQUIPMENT ROUTES ============

// Get all equipment
router.get('/equipment', protect, async (req, res) => {
  try {
    const { category, status } = req.query
    
    let query = {}
    if (category) query.category = category
    if (status) query.status = status

    const equipment = await Equipment.find(query).sort({ createdAt: -1 })

    res.json({
      success: true,
      equipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách thiết bị',
      error: error.message
    })
  }
})

// Get single equipment
router.get('/equipment/:id', protect, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      })
    }

    res.json({
      success: true,
      equipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin thiết bị',
      error: error.message
    })
  }
})

// Create equipment
router.post('/equipment', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body)

    res.status(201).json({
      success: true,
      equipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo thiết bị',
      error: error.message
    })
  }
})

// Update equipment
router.put('/equipment/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      })
    }

    res.json({
      success: true,
      equipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thiết bị',
      error: error.message
    })
  }
})

// Delete equipment
router.delete('/equipment/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      })
    }

    res.json({
      success: true,
      message: 'Đã xóa thiết bị'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa thiết bị',
      error: error.message
    })
  }
})

export default router
