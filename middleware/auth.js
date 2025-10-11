import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập'
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      req.admin = await Admin.findById(decoded.id).select('-password')
      
      if (!req.admin || !req.admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này'
      })
    }
    next()
  }
}
