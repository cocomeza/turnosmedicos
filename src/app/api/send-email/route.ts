import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/replitmail';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaz para los datos del turno
interface AppointmentData {
  doctorName: string;
  specialtyName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData: AppointmentData = await request.json();
    
    const {
      doctorName,
      specialtyName, 
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime
    } = appointmentData;

    // Formatear la fecha para mostrar en español
    const formattedDate = format(new Date(appointmentDate), 'EEEE, d MMMM yyyy', { locale: es });
    
    // Email para el paciente - Confirmación de turno
    const patientEmailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmación de Turno Médico</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f8f9fa; }
    .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; }
    .details { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; }
    .highlight { color: #2196F3; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .button { background: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ ¡Turno Confirmado!</h1>
    <p>Tu cita médica ha sido reservada exitosamente</p>
  </div>
  
  <div class="content">
    <div class="card">
      <h2>Hola, ${patientName} 👋</h2>
      <p>Te confirmamos que tu turno médico ha sido reservado exitosamente. A continuación encontrarás todos los detalles de tu cita:</p>
      
      <div class="details">
        <h3>📋 Detalles de la Cita</h3>
        <p><strong>👨‍⚕️ Médico:</strong> Dr. ${doctorName}</p>
        <p><strong>🏥 Especialidad:</strong> ${specialtyName}</p>
        <p><strong>📅 Fecha:</strong> <span class="highlight">${formattedDate}</span></p>
        <p><strong>🕐 Hora:</strong> <span class="highlight">${appointmentTime}</span></p>
        <p><strong>📧 Email del paciente:</strong> ${patientEmail}</p>
        <p><strong>📞 Teléfono:</strong> ${patientPhone}</p>
      </div>
      
      <div class="card" style="background: #e8f5e8; border-left: 4px solid #4caf50;">
        <h3>📝 Recordatorios importantes:</h3>
        <ul>
          <li>Llega <strong>15 minutos antes</strong> de tu cita</li>
          <li>Trae tu <strong>documento de identidad</strong></li>
          <li>Trae tu <strong>obra social</strong> (si corresponde)</li>
          <li>Si necesitas cancelar o reprogramar, contactanos con anticipación</li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Este es un email automático. Si tienes alguna consulta, no dudes en contactarnos.</p>
    <p><em>Sistema de Turnos Médicos - Cuidando tu salud</em></p>
  </div>
</body>
</html>`;

    // Versión de texto plano del email del paciente
    const patientTextContent = `¡TURNO CONFIRMADO!

Hola ${patientName},

Te confirmamos que tu turno médico ha sido reservado exitosamente.

DETALLES DE LA CITA:
• Médico: Dr. ${doctorName}
• Especialidad: ${specialtyName}  
• Fecha: ${formattedDate}
• Hora: ${appointmentTime}
• Email: ${patientEmail}
• Teléfono: ${patientPhone}

RECORDATORIOS IMPORTANTES:
• Llega 15 minutos antes de tu cita
• Trae tu documento de identidad
• Trae tu obra social (si corresponde)
• Si necesitas cancelar o reprogramar, contactanos con anticipación

Este es un email automático del Sistema de Turnos Médicos.`;

    // Email para el consultorio - Notificación de nuevo turno
    const officeEmailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuevo Turno Reservado</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f8f9fa; }
    .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; }
    .details { background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff5722; }
    .patient-info { background: #f3e5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0; }
    .highlight { color: #ff5722; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📅 Nuevo Turno Reservado</h1>
    <p>Se ha reservado una nueva cita médica</p>
  </div>
  
  <div class="content">
    <div class="card">
      <h2>Notificación de Turno 🏥</h2>
      <p>Se ha registrado un nuevo turno en el sistema. A continuación los detalles:</p>
      
      <div class="details">
        <h3>📋 Información de la Cita</h3>
        <p><strong>👨‍⚕️ Médico:</strong> Dr. ${doctorName}</p>
        <p><strong>🏥 Especialidad:</strong> ${specialtyName}</p>
        <p><strong>📅 Fecha:</strong> <span class="highlight">${formattedDate}</span></p>
        <p><strong>🕐 Hora:</strong> <span class="highlight">${appointmentTime}</span></p>
      </div>
      
      <div class="patient-info">
        <h3>👤 Datos del Paciente</h3>
        <p><strong>📝 Nombre:</strong> ${patientName}</p>
        <p><strong>📧 Email:</strong> ${patientEmail}</p>
        <p><strong>📞 Teléfono:</strong> ${patientPhone}</p>
      </div>
      
      <div class="card" style="background: #e8f5e8; border-left: 4px solid #4caf50;">
        <h3>ℹ️ Información adicional:</h3>
        <ul>
          <li>El paciente ha recibido una confirmación automática por email</li>
          <li>Se le han proporcionado las indicaciones previas a la consulta</li>
          <li>El turno queda registrado en el sistema</li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Este es un email automático generado por el Sistema de Turnos Médicos.</p>
    <p><em>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</em></p>
  </div>
</body>
</html>`;

    // Versión de texto plano del email del consultorio  
    const officeTextContent = `NUEVO TURNO RESERVADO

Se ha registrado un nuevo turno en el sistema:

INFORMACIÓN DE LA CITA:
• Médico: Dr. ${doctorName}
• Especialidad: ${specialtyName}
• Fecha: ${formattedDate}  
• Hora: ${appointmentTime}

DATOS DEL PACIENTE:
• Nombre: ${patientName}
• Email: ${patientEmail}
• Teléfono: ${patientPhone}

INFORMACIÓN ADICIONAL:
• El paciente ha recibido confirmación automática por email
• Se le han proporcionado las indicaciones previas
• El turno queda registrado en el sistema

Email automático - Sistema de Turnos Médicos
Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

    // Enviar ambos emails
    const [patientResult, officeResult] = await Promise.all([
      // Email al paciente
      sendEmail({
        to: patientEmail,
        subject: `✅ Turno Confirmado - Dr. ${doctorName} - ${formattedDate} a las ${appointmentTime}`,
        html: patientEmailContent,
        text: patientTextContent,
      }),
      // Email al consultorio
      sendEmail({
        to: 'mezacoco13@gmail.com',
        subject: `🏥 Nuevo Turno - Dr. ${doctorName} - ${patientName} - ${formattedDate} ${appointmentTime}`,
        html: officeEmailContent,
        text: officeTextContent,
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Emails enviados correctamente',
      details: {
        patientEmail: patientResult,
        officeEmail: officeResult
      }
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al enviar los emails',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}