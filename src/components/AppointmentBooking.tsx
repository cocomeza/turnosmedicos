'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'
import { format, addDays, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface AppointmentBookingProps {
  doctorId: string
  onBack: () => void
}

export default function AppointmentBooking({ doctorId, onBack }: AppointmentBookingProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1))

  useEffect(() => {
    fetchDoctor()
  }, [doctorId])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes()
    }
  }, [selectedDate])

  const fetchDoctor = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        specialty:specialties(name)
      `)
      .eq('id', doctorId)
      .single()
    
    if (data) setDoctor(data)
    if (error) console.error('Error fetching doctor:', error)
  }

  const fetchAvailableTimes = async () => {
    if (!selectedDate) return

    const dayOfWeek = selectedDate.getDay()
    
    // Obtener horario del médico para ese día
    const { data: schedule } = await supabase
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (!schedule) {
      setAvailableTimes([])
      return
    }

    // Obtener turnos ya reservados para esa fecha
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', format(selectedDate, 'yyyy-MM-dd'))
      .neq('status', 'cancelled')

    const bookedTimes = existingAppointments?.map(apt => apt.appointment_time) || []

    // Generar horarios disponibles (cada 30 minutos)
    const times = []
    const start = new Date(`2000-01-01 ${schedule.start_time}`)
    const end = new Date(`2000-01-01 ${schedule.end_time}`)
    
    while (start < end) {
      const timeString = format(start, 'HH:mm')
      if (!bookedTimes.includes(timeString)) {
        times.push(timeString)
      }
      start.setMinutes(start.getMinutes() + 30)
    }

    setAvailableTimes(times)
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !patientInfo.name || !patientInfo.email) {
      alert('Por favor complete todos los campos')
      return
    }

    // Crear o buscar paciente
    let { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('email', patientInfo.email)
      .single()

    if (!patient) {
      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert([patientInfo])
        .select('id')
        .single()
      
      if (error) {
        alert('Error al crear paciente')
        return
      }
      patient = newPatient
    }

    // Crear turno
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        doctor_id: doctorId,
        patient_id: patient.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        status: 'scheduled'
      }])

    if (error) {
      alert('Error al crear el turno')
      console.error(error)
    } else {
      alert('¡Turno reservado exitosamente!')
      onBack()
    }
  }

  if (!doctor) {
    return <div className="text-center py-8">Cargando información del médico...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a médicos
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start space-x-4 mb-6">
          <div className="bg-gray-100 p-3 rounded-full">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600">{doctor.specialty?.name}</p>
            <p className="text-gray-600 mt-2">{doctor.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selección de fecha */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Seleccionar Fecha
            </h3>
            <div className="space-y-2">
              {nextWeekDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedDate && isSameDay(selectedDate, date)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {format(date, 'EEEE, d MMMM', { locale: es })}
                </button>
              ))}
            </div>
          </div>

          {/* Selección de hora */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Seleccionar Hora
            </h3>
            {selectedDate ? (
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
                {availableTimes.length === 0 && (
                  <p className="col-span-3 text-gray-500 text-center py-4">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Selecciona una fecha primero</p>
            )}
          </div>
        </div>

        {/* Información del paciente */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Información del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre completo"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={patientInfo.email}
              onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Teléfono"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={patientInfo.phone}
              onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Botón de confirmación */}
        <div className="mt-8">
          <button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || !patientInfo.name || !patientInfo.email}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Reservar Turno
          </button>
        </div>
      </div>
    </div>
  )
}