import express from 'express'
import Doctor from '../models/Doctor.js'
import Appointment from '../models/Appointment.js'

const router = express.Router()

// Doctor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      })
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email, isActive: true })

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      })
    }

    // Simple password check (in production, use bcrypt)
    if (password !== 'doctor123') {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      })
    }

    res.json({
      success: true,
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        phone: doctor.phone
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

// Get doctor's appointments
router.get('/:doctorId/appointments', async (req, res) => {
  try {
    const { doctorId } = req.params
    
    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      })
    }

    // Get appointments for doctor's specialty
    const appointments = await Appointment.find({
      specialty: doctor.specialty
    }).sort({ appointmentDate: -1, appointmentTime: -1 })

    res.json({
      success: true,
      data: appointments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách lịch hẹn',
      error: error.message
    })
  }
})

export default router

