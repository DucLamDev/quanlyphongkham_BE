import express from 'express'
import Appointment from '../models/Appointment.js'
import googleSheetsService from '../services/googleSheets.js'
import smsService from '../services/smsService.js'

const router = express.Router()

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, specialty, appointmentDate, appointmentTime, notes } = req.body

    // Validate required fields
    if (!fullName || !phone || !specialty || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }

    // Create appointment in MongoDB
    const appointment = new Appointment({
      fullName,
      phone,
      email,
      specialty,
      appointmentDate,
      appointmentTime,
      notes,
      status: 'pending'
    })

    await appointment.save()
    console.log('✅ Appointment saved to MongoDB')

    // Save to Google Sheets (async, don't wait)
    googleSheetsService.appendAppointment(appointment.toObject())
      .catch(err => console.error('Error saving to Google Sheets:', err))

    // Send SMS confirmation (async, don't wait)
    smsService.sendAppointmentConfirmation(phone, appointment.toObject())
      .catch(err => console.error('Error sending SMS:', err))

    res.status(201).json({
      success: true,
      message: 'Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận sớm.',
      data: appointment
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi đặt lịch'
    })
  }
})

// Get all appointments (admin)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách lịch hẹn'
    })
  }
})

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    res.json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin lịch hẹn'
    })
  }
})

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      })
    }

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
      message: 'Cập nhật trạng thái thành công',
      data: appointment
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật lịch hẹn'
    })
  }
})

// Delete appointment
router.delete('/:id', async (req, res) => {
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
      message: 'Xóa lịch hẹn thành công'
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa lịch hẹn'
    })
  }
})

export default router
