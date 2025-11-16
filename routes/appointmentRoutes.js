import express from 'express'
import Appointment from '../models/Appointment.js'
import Doctor from '../models/Doctor.js'
import googleSheetsService from '../services/googleSheets.js'
import smsService from '../services/smsService.js'

const router = express.Router()

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, specialty, appointmentDate, appointmentTime, notes, doctorId } = req.body

    // Validate required fields
    if (!fullName || !phone || !specialty || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }

    let assignedDoctor = null

    // If doctor is selected, check availability
    if (doctorId) {
      const doctor = await Doctor.findById(doctorId)
      if (!doctor || !doctor.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Bác sĩ không tồn tại hoặc không còn hoạt động'
        })
      }

      // Check if doctor is available at this time
      const existingAppointments = await Appointment.countDocuments({
        doctorId: doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        status: { $in: ['pending', 'confirmed'] }
      })

      if (existingAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Bác sĩ ${doctor.name} đã có lịch hẹn vào thời gian này. Vui lòng chọn giờ khác hoặc bác sĩ khác.`
        })
      }

      assignedDoctor = doctor
    } else {
      // Random assign doctor from the specialty
      const availableDoctors = await Doctor.find({
        specialty: specialty,
        isActive: true
      })

      if (availableDoctors.length > 0) {
        // Filter out doctors who are busy at this time
        const freeDoctors = []
        for (const doctor of availableDoctors) {
          const busyCount = await Appointment.countDocuments({
            doctorId: doctor._id,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            status: { $in: ['pending', 'confirmed'] }
          })
          if (busyCount === 0) {
            freeDoctors.push(doctor)
          }
        }

        // Random pick from free doctors, or from all if all are busy
        const doctorPool = freeDoctors.length > 0 ? freeDoctors : availableDoctors
        assignedDoctor = doctorPool[Math.floor(Math.random() * doctorPool.length)]
      }
    }

    // Create appointment in MongoDB
    const appointment = new Appointment({
      fullName,
      phone,
      email,
      specialty,
      doctorId: assignedDoctor?._id || null,
      doctorName: assignedDoctor?.name || null,
      appointmentDate,
      appointmentTime,
      notes,
      status: 'pending'
    })

    await appointment.save()
    console.log('✅ Appointment saved to MongoDB', assignedDoctor ? `with doctor: ${assignedDoctor.name}` : 'without doctor')

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

// Get available specialties (for booking form)
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty', { isActive: true })
    const formatted = specialties
      .filter(Boolean)
      .map((item) => item.trim())
      .filter((item, index, arr) => item && arr.indexOf(item) === index)
      .sort((a, b) => a.localeCompare(b, 'vi'))

    res.json({
      success: true,
      data: formatted
    })
  } catch (error) {
    console.error('Error fetching specialties:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách chuyên khoa'
    })
  }
})

// Public doctor list for booking helper
router.get('/providers', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('name specialty title experience')
      .sort({ name: 1 })

    res.json({
      success: true,
      data: doctors
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách bác sĩ'
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
