import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AppointmentData {
  id: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  doctorName: string
  specialty: string
  date: Date
  time: string
  createdAt: Date
}

export const generateAppointmentReceipt = (appointment: AppointmentData) => {
  const doc = new jsPDF()
  
  // Configurar fuente
  doc.setFont('helvetica')
  
  // Header con logo/título
  doc.setFillColor(59, 130, 246) // blue-500
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('COMPROBANTE DE TURNO MÉDICO', 105, 15, { align: 'center' })
  
  // Reset color
  doc.setTextColor(0, 0, 0)
  
  // Información del comprobante
  doc.setFontSize(10)
  doc.setTextColor(128, 128, 128)
  doc.text(`Comprobante N°: ${appointment.id.slice(-8).toUpperCase()}`, 20, 35)
  doc.text(`Fecha de emisión: ${format(appointment.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 40)
  
  // Título principal
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.text('DETALLES DE LA CITA MÉDICA', 20, 55)
  
  // Línea separadora
  doc.setLineWidth(0.5)
  doc.line(20, 60, 190, 60)
  
  // Información de la cita
  doc.setFontSize(12)
  
  // Datos del paciente
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL PACIENTE:', 20, 75)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre: ${appointment.patientName}`, 25, 85)
  doc.text(`Email: ${appointment.patientEmail}`, 25, 92)
  if (appointment.patientPhone) {
    doc.text(`Teléfono: ${appointment.patientPhone}`, 25, 99)
  }
  
  // Datos del médico
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL MÉDICO:', 20, 115)
  doc.setFont('helvetica', 'normal')
  doc.text(`Doctor/a: ${appointment.doctorName}`, 25, 125)
  doc.text(`Especialidad: ${appointment.specialty}`, 25, 132)
  
  // Datos de la cita
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE LA CITA:', 20, 148)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${format(appointment.date, 'EEEE, dd MMMM yyyy', { locale: es })}`, 25, 158)
  doc.text(`Hora: ${appointment.time}`, 25, 165)
  
  // Box destacado con recordatorio
  doc.setFillColor(59, 130, 246, 0.1)
  doc.rect(20, 180, 170, 35, 'F')
  doc.setFillColor(59, 130, 246)
  doc.rect(20, 180, 170, 3, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RECORDATORIO IMPORTANTE:', 25, 190)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('• Llegar 15 minutos antes de la cita', 25, 197)
  doc.text('• Traer documento de identidad', 25, 203)
  doc.text('• Traer obra social o prepaga (si aplica)', 25, 209)
  
  // Información de contacto
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  doc.text('Para consultas o reprogramación, contacte al centro médico', 25, 225)
  
  // Footer
  doc.setFillColor(248, 249, 250)
  doc.rect(0, 270, 210, 27, 'F')
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(8)
  doc.text('Este comprobante es válido únicamente para la fecha y hora especificadas.', 105, 280, { align: 'center' })
  doc.text('Conserve este documento hasta la realización de su cita médica.', 105, 285, { align: 'center' })
  doc.text('Desarrollado por Botón Creativo', 105, 292, { align: 'center' })
  
  return doc
}

export const downloadAppointmentReceipt = (appointment: AppointmentData) => {
  const doc = generateAppointmentReceipt(appointment)
  const fileName = `comprobante-turno-${format(appointment.date, 'yyyy-MM-dd')}-${appointment.time.replace(':', '')}.pdf`
  doc.save(fileName)
}