import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

class GoogleSheetsService {
  constructor() {
    this.auth = null
    this.sheets = null
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    this.initialize()
  }

  initialize() {
    try {
      // Replace \\n with actual newlines in the private key
      const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
        ? process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
        : null

      if (!privateKey || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
        console.warn('⚠️ Google Sheets credentials not configured')
        return
      }

      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      console.log('✅ Google Sheets service initialized')
    } catch (error) {
      console.error('❌ Google Sheets initialization error:', error.message)
    }
  }

  async appendAppointment(data) {
    if (!this.sheets || !this.spreadsheetId) {
      console.warn('⚠️ Google Sheets not configured, skipping append')
      return { success: false, message: 'Google Sheets not configured' }
    }

    try {
      const values = [
        [
          new Date().toLocaleString('vi-VN'),
          data.fullName,
          data.phone,
          data.email || '',
          data.specialty,
          new Date(data.appointmentDate).toLocaleDateString('vi-VN'),
          data.appointmentTime,
          data.notes || '',
          data.status || 'pending'
        ]
      ]

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Appointments!A:I', // Adjust sheet name if needed
        valueInputOption: 'RAW',
        resource: { values },
      })

      console.log('✅ Appointment added to Google Sheets')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Error appending to Google Sheets:', error.message)
      return { success: false, error: error.message }
    }
  }

  async appendQuestion(data) {
    if (!this.sheets || !this.spreadsheetId) {
      console.warn('⚠️ Google Sheets not configured, skipping append')
      return { success: false, message: 'Google Sheets not configured' }
    }

    try {
      const values = [
        [
          new Date().toLocaleString('vi-VN'),
          data.fullName,
          data.phone,
          data.email || '',
          data.question,
          data.status || 'pending'
        ]
      ]

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Questions!A:F', // Adjust sheet name if needed
        valueInputOption: 'RAW',
        resource: { values },
      })

      console.log('✅ Question added to Google Sheets')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Error appending to Google Sheets:', error.message)
      return { success: false, error: error.message }
    }
  }
}

export default new GoogleSheetsService()
