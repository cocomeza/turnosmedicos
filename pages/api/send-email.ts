import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
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

// Respuesta de la API
interface EmailResponse {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailResponse>
) {
  // Solo aceptar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Use POST.',
      error: 'Método no permitido. Use POST.'
    });
  }

  try {
    const appointmentData: AppointmentData = req.body;
    
    const {
      doctorName,
      specialtyName, 
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime
    } = appointmentData;

    // Validar datos requeridos
    if (!doctorName || !patientName || !patientEmail || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para enviar el email',
        error: 'Faltan datos requeridos para enviar el email'
      });
    }

    // Configurar el transporte de Nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true para puerto 465
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Gmail
      },
    });

    // Verificar la conexión SMTP
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Error verificando conexión SMTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor de correo',
        error: 'Error de configuración del servidor de correo'
      });
    }

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
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
    }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px; }
    .card { 
      background: white; 
      padding: 25px; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.07); 
      margin: 20px 0; 
    }
    .details { 
      background: #e3f2fd; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 4px solid #2196F3; 
      margin: 20px 0; 
    }
    .details h3 { margin-top: 0; color: #1976d2; }
    .highlight { color: #2196F3; font-weight: 600; }
    .reminder-box { 
      background: #e8f5e8; 
      border-left: 4px solid #4caf50; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      color: #666; 
      font-size: 14px; 
      background: #f8f9fa; 
    }
    .logo { font-size: 24px; margin-bottom: 10px; }
    @media (max-width: 600px) {
      .content, .header { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏥</div>
      <h1>¡Turno Confirmado!</h1>
      <p>Tu cita médica ha sido reservada exitosamente</p>
    </div>
    
    <div class="content">
      <h2>Hola, ${patientName} 👋</h2>
      <p>Te confirmamos que tu turno médico ha sido reservado exitosamente. A continuación encontrarás todos los detalles de tu cita:</p>
      
      <div class="details">
        <h3>📋 Detalles de la Cita</h3>
        <p><strong>👨‍⚕️ Médico:</strong> Dr. ${doctorName}</p>
        <p><strong>🏥 Especialidad:</strong> ${specialtyName || 'No especificada'}</p>
        <p><strong>📅 Fecha:</strong> <span class="highlight">${formattedDate}</span></p>
        <p><strong>🕐 Hora:</strong> <span class="highlight">${appointmentTime}</span></p>
        <p><strong>📞 Teléfono:</strong> ${patientPhone}</p>
      </div>
      
      <div class="reminder-box">
        <h3>📝 Recordatorios importantes:</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Llega 15 minutos antes</strong> de tu cita</li>
          <li>Trae tu <strong>documento de identidad</strong></li>
          <li>Trae tu <strong>obra social</strong> (si corresponde)</li>
          <li>Si necesitas cancelar, contactanos con anticipación</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Este es un email automático. Si tienes alguna consulta, no dudes en contactarnos.</p>
      <p><em>Sistema de Turnos Médicos - Cuidando tu salud</em></p>
    </div>
  </div>
</body>
</html>`;

    // Versión de texto plano del email del paciente
    const patientTextContent = `¡TURNO CONFIRMADO!

Hola ${patientName},

Te confirmamos que tu turno médico ha sido reservado exitosamente.

DETALLES DE LA CITA:
• Médico: Dr. ${doctorName}
• Especialidad: ${specialtyName || 'No especificada'}
• Fecha: ${formattedDate}
• Hora: ${appointmentTime}
• Teléfono: ${patientPhone}

RECORDATORIOS IMPORTANTES:
• Llega 15 minutos antes de tu cita
• Trae tu documento de identidad
• Trae tu obra social (si corresponde)
• Si necesitas cancelar, contactanos con anticipación

Este es un email automático del Sistema de Turnos Médicos.`;

    // Email para el consultorio - Notificación de nuevo turno
    const officeEmailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuevo Turno Reservado</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
    }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { 
      background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .content { padding: 30px; }
    .details { 
      background: #fff3e0; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 4px solid #ff5722; 
      margin: 20px 0; 
    }
    .patient-info { 
      background: #f3e5f5; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 4px solid #9c27b0; 
      margin: 20px 0; 
    }
    .highlight { color: #ff5722; font-weight: 600; }
    .footer { 
      text-align: center; 
      padding: 30px; 
      color: #666; 
      font-size: 14px; 
      background: #f8f9fa; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Nuevo Turno Reservado</h1>
      <p>Se ha registrado una nueva cita médica</p>
    </div>
    
    <div class="content">
      <h2>Notificación de Turno 🏥</h2>
      <p>Se ha registrado un nuevo turno en el sistema. A continuación los detalles:</p>
      
      <div class="details">
        <h3>📋 Información de la Cita</h3>
        <p><strong>👨‍⚕️ Médico:</strong> Dr. ${doctorName}</p>
        <p><strong>🏥 Especialidad:</strong> ${specialtyName || 'No especificada'}</p>
        <p><strong>📅 Fecha:</strong> <span class="highlight">${formattedDate}</span></p>
        <p><strong>🕐 Hora:</strong> <span class="highlight">${appointmentTime}</span></p>
      </div>
      
      <div class="patient-info">
        <h3>👤 Datos del Paciente</h3>
        <p><strong>📝 Nombre:</strong> ${patientName}</p>
        <p><strong>📧 Email:</strong> ${patientEmail}</p>
        <p><strong>📞 Teléfono:</strong> ${patientPhone}</p>
      </div>
      
      <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; border-radius: 8px;">
        <h3>ℹ️ Información adicional:</h3>
        <ul>
          <li>El paciente ha recibido confirmación automática por email</li>
          <li>Se le han proporcionado las indicaciones previas</li>
          <li>El turno queda registrado en el sistema</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Email automático generado por el Sistema de Turnos Médicos.</p>
      <p><em>Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</em></p>
    </div>
  </div>
</body>
</html>`;

    // Versión de texto plano del email del consultorio  
    const officeTextContent = `NUEVO TURNO RESERVADO

Se ha registrado un nuevo turno en el sistema:

INFORMACIÓN DE LA CITA:
• Médico: Dr. ${doctorName}
• Especialidad: ${specialtyName || 'No especificada'}
• Fecha: ${formattedDate}  
• Hora: ${appointmentTime}

DATOS DEL PACIENTE:
• Nombre: ${patientName}
• Email: ${patientEmail}
• Teléfono: ${patientPhone}

INFORMACIÓN ADICIONAL:
• El paciente ha recibido confirmación automática
• Se le han proporcionado las indicaciones previas
• El turno queda registrado en el sistema

Email automático - Sistema de Turnos Médicos
Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

    // Configurar opciones de email para el paciente
    const patientMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Turnos'}" <${process.env.GMAIL_USER}>`,
      to: patientEmail,
      replyTo: patientEmail, // Permite responder al paciente
      subject: `✅ Turno Confirmado - Dr. ${doctorName} - ${formattedDate} a las ${appointmentTime}`,
      html: patientEmailContent,
      text: patientTextContent,
    };

    // Configurar opciones de email para el consultorio
    const officeMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Turnos'}" <${process.env.GMAIL_USER}>`,
      to: process.env.OFFICE_EMAIL || 'mezacoco13@gmail.com',
      replyTo: patientEmail, // Permite responder al paciente
      subject: `🏥 Nuevo Turno - Dr. ${doctorName} - ${patientName} - ${formattedDate} ${appointmentTime}`,
      html: officeEmailContent,
      text: officeTextContent,
    };

    // Enviar ambos emails en paralelo
    const [patientResult, officeResult] = await Promise.allSettled([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(officeMailOptions)
    ]);

    // Verificar resultados
    const patientSuccess = patientResult.status === 'fulfilled';
    const officeSuccess = officeResult.status === 'fulfilled';

    if (patientSuccess && officeSuccess) {
      return res.status(200).json({
        success: true,
        message: 'Emails enviados correctamente a paciente y consultorio',
        details: {
          patientEmail: patientResult.status === 'fulfilled' ? patientResult.value.messageId : null,
          officeEmail: officeResult.status === 'fulfilled' ? officeResult.value.messageId : null
        }
      });
    } else {
      // Si alguno falló, reportar el error pero no fallar completamente
      const errors = [];
      if (!patientSuccess) {
        errors.push(`Paciente: ${patientResult.status === 'rejected' ? patientResult.reason.message : 'Error desconocido'}`);
      }
      if (!officeSuccess) {
        errors.push(`Consultorio: ${officeResult.status === 'rejected' ? officeResult.reason.message : 'Error desconocido'}`);
      }

      return res.status(207).json({ // 207 Multi-Status
        success: patientSuccess || officeSuccess, // Parcialmente exitoso
        message: `Emails enviados parcialmente. Errores: ${errors.join(', ')}`,
        details: {
          patientEmail: patientSuccess ? (patientResult as any).value.messageId : null,
          officeEmail: officeSuccess ? (officeResult as any).value.messageId : null,
          errors
        }
      });
    }

  } catch (error) {
    console.error('Error enviando emails:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al enviar emails',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}