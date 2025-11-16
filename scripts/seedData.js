import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Doctor from '../models/Doctor.js'
import Equipment from '../models/Equipment.js'

dotenv.config()

const doctors = [
  { name: 'BS. Nguyễn Văn An', title: 'Bác sĩ', specialty: 'Nội khoa', phone: '0912345001', email: 'nguyenvanan@phongkham.vn', experience: '15', education: 'Bác sĩ, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Trần Thị Bình', title: 'Bác sĩ', specialty: 'Nội khoa', phone: '0912345002', email: 'tranthibinh@phongkham.vn', experience: '12', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Lê Văn Cường', title: 'Bác sĩ Chuyên khoa II', specialty: 'Ngoại khoa', phone: '0912345003', email: 'levancuong@phongkham.vn', experience: '18', education: 'Bác sĩ Chuyên khoa II, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Phạm Thị Dung', title: 'Bác sĩ', specialty: 'Ngoại khoa', phone: '0912345004', email: 'phamthidung@phongkham.vn', experience: '10', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Hoàng Văn Em', title: 'Bác sĩ Chuyên khoa I', specialty: 'Nhi khoa', phone: '0912345005', email: 'hoangvanem@phongkham.vn', experience: '14', education: 'Bác sĩ Chuyên khoa I, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Vũ Thị Hoa', title: 'Bác sĩ', specialty: 'Nhi khoa', phone: '0912345006', email: 'vuthihoa@phongkham.vn', experience: '11', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Đỗ Văn Khoa', title: 'Bác sĩ Chuyên khoa II', specialty: 'Sản phụ khoa', phone: '0912345007', email: 'dovankhoa@phongkham.vn', experience: '16', education: 'Bác sĩ Chuyên khoa II, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Ngô Thị Lan', title: 'Bác sĩ Chuyên khoa I', specialty: 'Sản phụ khoa', phone: '0912345008', email: 'ngothilan@phongkham.vn', experience: '13', education: 'Bác sĩ Chuyên khoa I, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Bùi Văn Minh', title: 'Bác sĩ', specialty: 'Da liễu', phone: '0912345009', email: 'buivanminh@phongkham.vn', experience: '9', education: 'Bác sĩ, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Lý Thị Nga', title: 'Bác sĩ', specialty: 'Da liễu', phone: '0912345010', email: 'lythinga@phongkham.vn', experience: '8', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Trịnh Văn Phúc', title: 'Bác sĩ Chuyên khoa I', specialty: 'Tai Mũi Họng', phone: '0912345011', email: 'trinhvanphuc@phongkham.vn', experience: '12', education: 'Bác sĩ Chuyên khoa I, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Đặng Thị Quỳnh', title: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0912345012', email: 'dangthiquynh@phongkham.vn', experience: '10', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Phan Văn Sơn', title: 'Bác sĩ Chuyên khoa I', specialty: 'Mắt', phone: '0912345013', email: 'phanvanson@phongkham.vn', experience: '14', education: 'Bác sĩ Chuyên khoa I, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Võ Thị Tâm', title: 'Bác sĩ', specialty: 'Mắt', phone: '0912345014', email: 'vothitam@phongkham.vn', experience: '11', education: 'Bác sĩ, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Hồ Văn Tùng', title: 'Bác sĩ Răng Hàm Mặt', specialty: 'Răng Hàm Mặt', phone: '0912345015', email: 'hovantung@phongkham.vn', experience: '13', education: 'Bác sĩ Răng Hàm Mặt, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Mai Thị Uyên', title: 'Bác sĩ Răng Hàm Mặt', specialty: 'Răng Hàm Mặt', phone: '0912345016', email: 'maithiuyen@phongkham.vn', experience: '9', education: 'Bác sĩ Răng Hàm Mặt, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Dương Văn Việt', title: 'Bác sĩ Chuyên khoa II', specialty: 'Tim mạch', phone: '0912345017', email: 'duongvanviet@phongkham.vn', experience: '17', education: 'Bác sĩ Chuyên khoa II, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Lưu Thị Xuân', title: 'Bác sĩ Chuyên khoa I', specialty: 'Tim mạch', phone: '0912345018', email: 'luuthixuan@phongkham.vn', experience: '12', education: 'Bác sĩ Chuyên khoa I, Đại học Y Dược TP.HCM', isActive: true },
  { name: 'BS. Cao Văn Yên', title: 'Bác sĩ Chuyên khoa II', specialty: 'Thần kinh', phone: '0912345019', email: 'caovanyen@phongkham.vn', experience: '15', education: 'Bác sĩ Chuyên khoa II, Đại học Y Hà Nội', isActive: true },
  { name: 'BS. Đinh Thị Ánh', title: 'Bác sĩ Chuyên khoa I', specialty: 'Thần kinh', phone: '0912345020', email: 'dinhthianh@phongkham.vn', experience: '11', education: 'Bác sĩ Chuyên khoa I, Đại học Y Dược TP.HCM', isActive: true }
]

const equipment = [
  { name: 'Máy siêu âm 4D', category: 'diagnostic', manufacturer: 'GE Healthcare', model: 'Voluson E10', serialNumber: 'GE-US-001', status: 'operational', purchaseDate: new Date('2022-01-15'), warrantyExpiry: new Date('2027-01-15'), specifications: 'Máy siêu âm 4D cao cấp cho sản khoa và chẩn đoán tổng quát', isActive: true },
  { name: 'Máy X-quang kỹ thuật số', category: 'diagnostic', manufacturer: 'Siemens', model: 'Luminos dRF Max', serialNumber: 'SIE-XR-002', status: 'operational', purchaseDate: new Date('2021-06-10'), warrantyExpiry: new Date('2026-06-10'), specifications: 'Hệ thống X-quang kỹ thuật số với độ phân giải cao', isActive: true },
  { name: 'Máy CT Scanner 64 lát cắt', category: 'diagnostic', manufacturer: 'Philips', model: 'Ingenuity CT', serialNumber: 'PHI-CT-003', status: 'operational', purchaseDate: new Date('2021-03-20'), warrantyExpiry: new Date('2026-03-20'), specifications: 'Máy chụp CT 64 lát cắt, chẩn đoán chính xác', isActive: true },
  { name: 'Máy MRI 1.5 Tesla', category: 'diagnostic', manufacturer: 'Siemens', model: 'Magnetom Aera', serialNumber: 'SIE-MRI-004', status: 'operational', purchaseDate: new Date('2020-11-05'), warrantyExpiry: new Date('2025-11-05'), specifications: 'Máy cộng hưởng từ 1.5 Tesla cho chẩn đoán thần kinh và cơ xương khớp', isActive: true },
  { name: 'Máy xét nghiệm sinh hóa tự động', category: 'laboratory', manufacturer: 'Roche', model: 'Cobas 6000', serialNumber: 'ROC-LAB-005', status: 'operational', purchaseDate: new Date('2022-02-15'), warrantyExpiry: new Date('2027-02-15'), specifications: 'Hệ thống xét nghiệm sinh hóa và miễn dịch tự động', isActive: true },
  { name: 'Máy xét nghiệm huyết học', category: 'laboratory', manufacturer: 'Sysmex', model: 'XN-1000', serialNumber: 'SYS-LAB-006', status: 'operational', purchaseDate: new Date('2022-03-10'), warrantyExpiry: new Date('2027-03-10'), specifications: 'Máy đếm và phân tích tế bào máu tự động', isActive: true },
  { name: 'Máy điện tim 12 kênh', category: 'diagnostic', manufacturer: 'Fukuda Denshi', model: 'CardiMax FX-8322', serialNumber: 'FUK-ECG-007', status: 'operational', purchaseDate: new Date('2022-04-20'), warrantyExpiry: new Date('2027-04-20'), specifications: 'Máy điện tim 12 kênh, in kết quả tức thì', isActive: true },
  { name: 'Máy thở cao cấp', category: 'treatment', manufacturer: 'Dräger', model: 'Evita V800', serialNumber: 'DRA-VEN-008', status: 'operational', purchaseDate: new Date('2021-08-15'), warrantyExpiry: new Date('2026-08-15'), specifications: 'Máy thở đa chức năng cho hồi sức cấp cứu', isActive: true },
  { name: 'Máy monitor theo dõi bệnh nhân', category: 'monitoring', manufacturer: 'Philips', model: 'IntelliVue MX800', serialNumber: 'PHI-MON-009', status: 'operational', purchaseDate: new Date('2022-05-10'), warrantyExpiry: new Date('2027-05-10'), specifications: 'Màn hình theo dõi đa thông số bệnh nhân', isActive: true },
  { name: 'Máy nội soi dạ dày', category: 'diagnostic', manufacturer: 'Olympus', model: 'EVIS EXERA III', serialNumber: 'OLY-END-010', status: 'operational', purchaseDate: new Date('2021-09-20'), warrantyExpiry: new Date('2026-09-20'), specifications: 'Hệ thống nội soi tiêu hóa HD+', isActive: true },
  { name: 'Máy nội soi phế quản', category: 'diagnostic', manufacturer: 'Pentax', model: 'EPK-i7010', serialNumber: 'PEN-END-011', status: 'operational', purchaseDate: new Date('2021-10-15'), warrantyExpiry: new Date('2026-10-15'), specifications: 'Máy nội soi phế quản chất lượng cao', isActive: true },
  { name: 'Máy phẫu thuật nội soi', category: 'surgical', manufacturer: 'Karl Storz', model: 'IMAGE1 S', serialNumber: 'KAR-SUR-012', status: 'operational', purchaseDate: new Date('2021-07-10'), warrantyExpiry: new Date('2026-07-10'), specifications: 'Hệ thống phẫu thuật nội soi 4K', isActive: true },
  { name: 'Đèn mổ LED', category: 'surgical', manufacturer: 'Berchtold', model: 'Chromophare D 580', serialNumber: 'BER-SUR-013', status: 'operational', purchaseDate: new Date('2022-01-05'), warrantyExpiry: new Date('2027-01-05'), specifications: 'Đèn mổ LED không bóng, điều chỉnh nhiệt độ màu', isActive: true },
  { name: 'Bàn mổ điện đa năng', category: 'surgical', manufacturer: 'Maquet', model: 'Alphamaxx', serialNumber: 'MAQ-SUR-014', status: 'operational', purchaseDate: new Date('2021-12-15'), warrantyExpiry: new Date('2026-12-15'), specifications: 'Bàn mổ điện đa năng, điều chỉnh linh hoạt', isActive: true },
  { name: 'Máy khử trùng Autoclave', category: 'other', manufacturer: 'Tuttnauer', model: 'T-Edge', serialNumber: 'TUT-STE-015', status: 'operational', purchaseDate: new Date('2022-06-01'), warrantyExpiry: new Date('2027-06-01'), specifications: 'Máy khử trùng hơi nước áp suất cao', isActive: true },
  { name: 'Tủ lạnh bảo quản vaccine', category: 'other', manufacturer: 'Haier', model: 'HYC-390', serialNumber: 'HAI-STO-016', status: 'operational', purchaseDate: new Date('2022-07-10'), warrantyExpiry: new Date('2027-07-10'), specifications: 'Tủ lạnh chuyên dụng bảo quản vaccine 2-8°C', isActive: true },
  { name: 'Máy đo mật độ xương', category: 'diagnostic', manufacturer: 'Hologic', model: 'Horizon DXA', serialNumber: 'HOL-DXA-017', status: 'operational', purchaseDate: new Date('2021-11-20'), warrantyExpiry: new Date('2026-11-20'), specifications: 'Máy đo mật độ xương bằng tia X năng lượng kép', isActive: true },
  { name: 'Máy đo thị lực tự động', category: 'diagnostic', manufacturer: 'Topcon', model: 'KR-800', serialNumber: 'TOP-OPH-018', status: 'operational', purchaseDate: new Date('2022-08-15'), warrantyExpiry: new Date('2027-08-15'), specifications: 'Máy đo khúc xạ và độ cong giác mạc tự động', isActive: true },
  { name: 'Ghế nha khoa điện', category: 'treatment', manufacturer: 'Sirona', model: 'C4+', serialNumber: 'SIR-DEN-019', status: 'operational', purchaseDate: new Date('2022-09-01'), warrantyExpiry: new Date('2027-09-01'), specifications: 'Ghế nha khoa điện với đầy đủ phụ kiện', isActive: true },
  { name: 'Máy chụp X-quang răng', category: 'diagnostic', manufacturer: 'Planmeca', model: 'ProMax 3D', serialNumber: 'PLA-DEN-020', status: 'operational', purchaseDate: new Date('2021-10-05'), warrantyExpiry: new Date('2026-10-05'), specifications: 'Máy chụp X-quang răng 3D panorama', isActive: true }
]

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongkham')
    console.log('✅ Connected to MongoDB')

    console.log('🗑️  Clearing existing data...')
    await Doctor.deleteMany({})
    await Equipment.deleteMany({})

    console.log('👨‍⚕️  Inserting doctors...')
    const insertedDoctors = await Doctor.insertMany(doctors)
    console.log(`✅ Inserted ${insertedDoctors.length} doctors`)

    console.log('🏥  Inserting equipment...')
    const insertedEquipment = await Equipment.insertMany(equipment)
    console.log(`✅ Inserted ${insertedEquipment.length} equipment items`)

    console.log('\n🎉 Seed data completed successfully!')
    console.log(`\n📊 Summary:\n   - Doctors: ${insertedDoctors.length}\n   - Equipment: ${insertedEquipment.length}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
