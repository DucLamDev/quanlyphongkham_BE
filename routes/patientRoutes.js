import express from 'express'
import Appointment from '../models/Appointment.js'

const router = express.Router()

// Patient login (verify phone has appointments)
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số điện thoại'
      })
    }

    // Check if phone has any appointments
    const appointments = await Appointment.find({ phone })

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn với số điện thoại này'
      })
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { phone, appointmentCount: appointments.length }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    })
  }
})

// Get patient's appointments by phone
router.get('/:phone/appointments', async (req, res) => {
  try {
    const { phone } = req.params
    
    const appointments = await Appointment.find({ phone })
      .sort({ appointmentDate: -1, appointmentTime: -1 })

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

// Cancel appointment (patient can only cancel pending appointments)
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params
    const { phone } = req.body

    const appointment = await Appointment.findById(id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    // Verify phone matches
    if (appointment.phone !== phone) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy lịch hẹn này'
      })
    }

    // Can only cancel pending appointments
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy lịch hẹn đang chờ xác nhận'
      })
    }

    appointment.status = 'cancelled'
    await appointment.save()

    res.json({
      success: true,
      message: 'Đã hủy lịch hẹn thành công',
      data: appointment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi hủy lịch hẹn',
      error: error.message
    })
  }
})

export default router

