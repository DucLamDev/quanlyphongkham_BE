import express from 'express'
import Voucher from '../models/Voucher.js'

const router = express.Router()

// Validate voucher code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá'
      })
    }

    // Find voucher by code
    const voucher = await Voucher.findOne({ code: code.toUpperCase() })

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      })
    }

    // Check if voucher is valid
    const validation = voucher.isValid()

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      })
    }

    res.json({
      success: true,
      message: `Áp dụng mã giảm giá ${voucher.discountPercent}% thành công!`,
      data: {
        code: voucher.code,
        discountPercent: voucher.discountPercent,
        description: voucher.description
      }
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    })
  }
})

// Create voucher (admin only - for testing)
router.post('/', async (req, res) => {
  try {
    const { code, discountPercent, description, expiryDate, maxUses } = req.body

    const voucher = new Voucher({
      code: code.toUpperCase(),
      discountPercent,
      description,
      expiryDate,
      maxUses
    })

    await voucher.save()

    res.status(201).json({
      success: true,
      message: 'Tạo mã giảm giá thành công',
      data: voucher
    })
  } catch (error) {
    console.error('Error creating voucher:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi tạo mã giảm giá'
    })
  }
})

// Get all vouchers
router.get('/', async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 })

    res.json({
      success: true,
      count: vouchers.length,
      data: vouchers
    })
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá'
    })
  }
})

export default router
