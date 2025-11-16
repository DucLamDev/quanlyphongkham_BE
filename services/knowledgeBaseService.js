import Doctor from '../models/Doctor.js'
import Voucher from '../models/Voucher.js'

class KnowledgeBaseService {
  constructor() {
    this.clinicInfo = {
      name: 'Phòng Khám Đa Khoa Minh Giang',
      address: 'Khu đô thị Pom La, Điện Biên Phủ, Vietnam',
      hotline: '037 845 6839',
      workingHours: 'Thứ 2 - Chủ nhật, 7:00 - 20:00',
      services: [
        'Khám tổng quát',
        'Sản phụ khoa',
        'Tim mạch',
        'Mắt',
        'Xét nghiệm',
        'Tiêm chủng',
        'Chẩn đoán hình ảnh',
        'Tư vấn sức khỏe'
      ],
      insurancePartners: [
        'Blue Cross',
        'Manulife',
        'Allianz',
        'AXA',
        'Pacific Cross',
        'AIG',
        'FWD'
      ],
      specialties: [
        'Nội khoa tổng quát',
        'Ngoại khoa',
        'Sản phụ khoa',
        'Nhi khoa',
        'Tim mạch',
        'Mắt',
        'Tai mũi họng',
        'Da liễu',
        'Răng hàm mặt'
      ]
    }
  }

  async getDoctorsInfo() {
    try {
      const doctors = await Doctor.find({ isActive: true })
        .select('name title specialty experience education')
        .limit(10)
        .lean()
      
      return doctors.map(doc => ({
        name: doc.name,
        title: doc.title,
        specialty: doc.specialty,
        experience: doc.experience,
        education: doc.education
      }))
    } catch (error) {
      console.error('Error fetching doctors:', error)
      return []
    }
  }

  async getActiveVouchers() {
    try {
      const now = new Date()
      const vouchers = await Voucher.find({
        isActive: true,
        expiryDate: { $gte: now }
      })
        .select('code discountPercent description expiryDate')
        .limit(5)
        .lean()

      return vouchers.map(v => ({
        code: v.code,
        discount: v.discountPercent,
        description: v.description,
        expiryDate: v.expiryDate.toLocaleDateString('vi-VN')
      }))
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      return []
    }
  }

  async buildKnowledgeBase() {
    const doctors = await this.getDoctorsInfo()
    const vouchers = await this.getActiveVouchers()

    let knowledge = `
# THÔNG TIN PHÒNG KHÁM ĐA KHOA MINH GIANG

## THÔNG TIN CƠ BẢN
- Tên: ${this.clinicInfo.name}
- Địa chỉ: ${this.clinicInfo.address}
- Hotline: ${this.clinicInfo.hotline}
- Giờ làm việc: ${this.clinicInfo.workingHours}

## DỊCH VỤ
${this.clinicInfo.services.map(s => `- ${s}`).join('\n')}

## CHUYÊN KHOA
${this.clinicInfo.specialties.map(s => `- ${s}`).join('\n')}

## ĐỐI TÁC BẢO HIỂM
${this.clinicInfo.insurancePartners.map(i => `- ${i}`).join('\n')}
`

    // Add doctors information if available
    if (doctors.length > 0) {
      knowledge += `\n## ĐỘI NGŨ BÁC SĨ\n`
      doctors.forEach(doc => {
        knowledge += `\n### ${doc.name}\n`
        knowledge += `- Chức danh: ${doc.title}\n`
        knowledge += `- Chuyên khoa: ${doc.specialty}\n`
        knowledge += `- Kinh nghiệm: ${doc.experience}\n`
        if (doc.education) {
          knowledge += `- Học vấn: ${doc.education}\n`
        }
      })
    }

    // Add vouchers information if available
    if (vouchers.length > 0) {
      knowledge += `\n## CHƯƠNG TRÌNH KHUYẾN MÃI\n`
      vouchers.forEach(v => {
        knowledge += `\n### Mã ${v.code}\n`
        knowledge += `- Giảm giá: ${v.discount}%\n`
        knowledge += `- Mô tả: ${v.description}\n`
        knowledge += `- Hạn sử dụng: ${v.expiryDate}\n`
      })
    }

    knowledge += `\n## HƯỚNG DẪN ĐẶT LỊCH
- Đặt lịch trực tuyến: Truy cập website và điền form đặt lịch
- Đặt lịch qua điện thoại: Gọi hotline ${this.clinicInfo.hotline}
- Thời gian xác nhận: Trong vòng 24 giờ
- Lưu ý: Vui lòng đến trước 15 phút để làm thủ tục

## GIÁ KHÁM
- Khám tổng quát: 200.000 - 300.000 VNĐ
- Khám chuyên khoa: 300.000 - 500.000 VNĐ
- Xét nghiệm: Tùy theo loại xét nghiệm
- Chẩn đoán hình ảnh: 300.000 - 800.000 VNĐ
- Lưu ý: Giá có thể thay đổi, vui lòng liên hệ để biết chi tiết

## CHUẨN BỊ KHI ĐẾN KHÁM
- Giấy tờ tùy thân (CMND/CCCD)
- Thẻ bảo hiểm (nếu có)
- Hồ sơ bệnh án cũ (nếu có)
- Kết quả xét nghiệm trước đó (nếu có)
`

    return knowledge
  }

  getBasicInfo() {
    return this.clinicInfo
  }
}

export default new KnowledgeBaseService()
