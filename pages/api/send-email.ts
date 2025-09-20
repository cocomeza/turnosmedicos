import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer, { SentMessageInfo } from "nodemailer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  details?: {
    patientEmail?: string | null;
    officeEmail?: string | null;
    errors?: string[];
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido. Use POST.",
      error: "Método no permitido. Use POST.",
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
      appointmentTime,
    } = appointmentData;

    if (
      !doctorName ||
      !patientName ||
      !patientEmail ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos para enviar el email",
        error: "Faltan datos requeridos para enviar el email",
      });
    }

    // Configurar transporte
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    try {
      await transporter.verify();
    } catch (error) {
      console.error("Error verificando conexión SMTP:", error);
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor de correo",
        error: "Error de configuración del servidor de correo",
      });
    }

    const formattedDate = format(
      new Date(appointmentDate),
      "EEEE, d MMMM yyyy",
      { locale: es }
    );

    // Contenidos de email (te dejo tal cual estaban, no cambia nada de HTML)
    const patientEmailContent = `...`; // ⬅️ tu HTML del paciente aquí
    const patientTextContent = `...`;  // ⬅️ tu texto plano del paciente aquí
    const officeEmailContent = `...`;  // ⬅️ tu HTML del consultorio aquí
    const officeTextContent = `...`;   // ⬅️ tu texto plano del consultorio aquí

    const patientMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Sistema de Turnos"}" <${
        process.env.GMAIL_USER
      }>`,
      to: patientEmail,
      replyTo: patientEmail,
      subject: `✅ Turno Confirmado - Dr. ${doctorName} - ${formattedDate} a las ${appointmentTime}`,
      html: patientEmailContent,
      text: patientTextContent,
    };

    const officeMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Sistema de Turnos"}" <${
        process.env.GMAIL_USER
      }>`,
      to: process.env.OFFICE_EMAIL || "mezacoco13@gmail.com",
      replyTo: patientEmail,
      subject: `🏥 Nuevo Turno - Dr. ${doctorName} - ${patientName} - ${formattedDate} ${appointmentTime}`,
      html: officeEmailContent,
      text: officeTextContent,
    };

    // Tipamos la promesa para evitar any
    const [patientResult, officeResult] = await Promise.allSettled<
      SentMessageInfo
    >([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(officeMailOptions),
    ]);

    const patientSuccess = patientResult.status === "fulfilled";
    const officeSuccess = officeResult.status === "fulfilled";

    if (patientSuccess && officeSuccess) {
      return res.status(200).json({
        success: true,
        message: "Emails enviados correctamente a paciente y consultorio",
        details: {
          patientEmail: patientResult.value.messageId,
          officeEmail: officeResult.value.messageId,
        },
      });
    } else {
      const errors: string[] = [];
      if (!patientSuccess) {
        errors.push(
          `Paciente: ${
            patientResult.status === "rejected"
              ? patientResult.reason?.message || "Error desconocido"
              : "Error desconocido"
          }`
        );
      }
      if (!officeSuccess) {
        errors.push(
          `Consultorio: ${
            officeResult.status === "rejected"
              ? officeResult.reason?.message || "Error desconocido"
              : "Error desconocido"
          }`
        );
      }

      return res.status(207).json({
        success: patientSuccess || officeSuccess,
        message: `Emails enviados parcialmente. Errores: ${errors.join(", ")}`,
        details: {
          patientEmail: patientSuccess ? patientResult.value.messageId : null,
          officeEmail: officeSuccess ? officeResult.value.messageId : null,
          errors,
        },
      });
    }
  } catch (error) {
    console.error("Error enviando emails:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor al enviar emails",
      message:
        error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
