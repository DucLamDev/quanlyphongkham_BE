import express from 'express'
import Question from '../models/Question.js'
import googleSheetsService from '../services/googleSheets.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Create new question
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, question } = req.body

    // Validate required fields
    if (!fullName || !phone || !question) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }

    // Create question in MongoDB
    const newQuestion = new Question({
      fullName,
      phone,
      email,
      question,
      status: 'pending'
    })

    await newQuestion.save()
    console.log('✅ Question saved to MongoDB')

    // Save to Google Sheets (async, don't wait)
    googleSheetsService.appendQuestion(newQuestion.toObject())
      .catch(err => console.error('Error saving to Google Sheets:', err))

    res.status(201).json({
      success: true,
      message: 'Câu hỏi của bạn đã được gửi thành công!',
      data: newQuestion
    })
  } catch (error) {
    console.error('Error creating question:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi gửi câu hỏi'
    })
  }
})

// Get all questions (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({
      success: true,
      count: questions.length,
      data: questions
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách câu hỏi'
    })
  }
})

// Get single question
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      })
    }

    res.json({
      success: true,
      data: question
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin câu hỏi'
    })
  }
})

// Update question (answer)
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { answer, status } = req.body

    const updateData = {}
    if (answer) updateData.answer = answer
    if (status) updateData.status = status

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      })
    }

    res.json({
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: question
    })
  } catch (error) {
    console.error('Error updating question:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật câu hỏi'
    })
  }
})

// Delete question
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id)

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      })
    }

    res.json({
      success: true,
      message: 'Xóa câu hỏi thành công'
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa câu hỏi'
    })
  }
})

export default router
