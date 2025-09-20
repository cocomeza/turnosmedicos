'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Phone, Mail } from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase, Doctor } from '../lib/supabase'
import { format, addDays, isSameDay, startOfDay, setHours, setMinutes, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Fragment } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    // Generar horarios disponibles (cada 30 minutos) - más seguro contra timezones
    const times = []
    const [startHour, startMin] = schedule.start_time.split(':').map(Number)
    const [endHour, endMin] = schedule.end_time.split(':').map(Number)
    
    let currentTime = setMinutes(setHours(new Date(selectedDate), startHour), startMin)
    const endTime = setMinutes(setHours(new Date(selectedDate), endHour), endMin)
    
    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm')
      if (!bookedTimes.includes(timeString)) {
        times.push(timeString)
      }
      currentTime = addMinutes(currentTime, 30)
    }

    setAvailableTimes(times)
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !patientInfo.name || !patientInfo.email) {
      return // La validación ahora se maneja en el modal
    }

    setIsBooking(true)
    
    try {
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
          throw new Error('Error al crear paciente')
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
        throw new Error('Error al crear el turno')
      }

      // Enviar emails de confirmación
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorName: doctor?.name,
            specialtyName: doctor?.specialty?.name,
            patientName: patientInfo.name,
            patientEmail: patientInfo.email,
            patientPhone: patientInfo.phone,
            appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
            appointmentTime: selectedTime,
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResult.success) {
          console.warn('Error al enviar emails:', emailResult.error);
          // No interrumpimos el flujo si falla el email, solo lo registramos
        }
      } catch (emailError) {
        console.warn('Error al enviar emails de confirmación:', emailError);
        // No interrumpimos el flujo si falla el email
      }

      setShowConfirmModal(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error booking appointment:', error)
      setError('Hubo un problema al reservar tu turno. Por favor intenta nuevamente.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !patientInfo.name || !patientInfo.email) {
      return
    }
    setShowConfirmModal(true)
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
          {/* Date Picker Profesional */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Seleccionar Fecha
            </h3>
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                locale={es}
                minDate={new Date()}
                dateFormat="EEEE, d MMMM yyyy"
                inline
                className="w-full"
                calendarClassName="w-full border-0"
                dayClassName={(date) => {
                  const isPast = date < new Date()
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  const isToday = isSameDay(date, new Date())
                  
                  let classes = 'flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-all duration-200'
                  
                  if (isPast) {
                    classes += ' text-gray-300 cursor-not-allowed'
                  } else if (isSelected) {
                    classes += ' bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg'
                  } else if (isToday) {
                    classes += ' bg-green-100 text-green-800 font-semibold border-2 border-green-300'
                  } else {
                    classes += ' text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }
                  
                  return classes
                }}
                weekDayClassName={() => 'text-xs font-semibold text-gray-500 uppercase tracking-wide py-2'}
                monthClassName={() => 'text-lg font-bold text-gray-900 mb-4'}
              />
            </div>
            {selectedDate && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Fecha seleccionada:</span>{' '}
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
                </p>
              </div>
            )}
          </div>

          {/* Selección de hora mejorada */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Seleccionar Horario
            </h3>
            {selectedDate ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Horarios disponibles para {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTimes.map((time) => {
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                            : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
                {availableTimes.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No hay horarios disponibles</p>
                    <p className="text-sm text-gray-400">Intenta seleccionar otra fecha</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Selecciona una fecha primero</p>
                <p className="text-sm text-gray-400">Elige un día para ver los horarios disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del paciente mejorada */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Información del Paciente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-600 text-gray-900 font-medium bg-white shadow-sm hover:border-gray-300"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-600 text-gray-900 font-medium bg-white shadow-sm hover:border-gray-300"
                value={patientInfo.email}
                onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="+54 11 1234-5678"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-600 text-gray-900 font-medium bg-white shadow-sm hover:border-gray-300"
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Información importante:</span> Todos los campos son obligatorios para procesar tu reserva.
            </p>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón de confirmación */}
        <div className="mt-8">
          <button
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedTime || !patientInfo.name || !patientInfo.email}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            Reservar Turno
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Transition appear show={showConfirmModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowConfirmModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Confirmar Reserva de Turno
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h4 className="font-medium text-blue-900 mb-2">Detalles de la Cita</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><span className="font-medium">Médico:</span> Dr. {doctor?.name}</p>
                        <p><span className="font-medium">Especialidad:</span> {doctor?.specialty?.name}</p>
                        <p><span className="font-medium">Fecha:</span> {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}</p>
                        <p><span className="font-medium">Hora:</span> {selectedTime}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Información del Paciente</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium">Nombre:</span> {patientInfo.name}</p>
                        <p><span className="font-medium">Email:</span> {patientInfo.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {patientInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => setShowConfirmModal(false)}
                      disabled={isBooking}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                      onClick={handleBookAppointment}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Reservando...
                        </>
                      ) : (
                        'Confirmar Reserva'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Éxito */}
      <Transition appear show={showSuccessModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      ¡Turno Reservado Exitosamente!
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mb-6">
                      Hemos enviado los detalles de tu cita a tu correo electrónico. 
                      El Dr. {doctor?.name} te estará esperando.
                    </p>
                    
                    <div className="bg-green-50 p-4 rounded-xl mb-6 text-left">
                      <h4 className="font-medium text-green-900 mb-2">Recordatorio</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Llega 15 minutos antes de tu cita</li>
                        <li>• Trae tu documento de identidad</li>
                        <li>• Trae tu obra social (si tienes)</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => {
                        setShowSuccessModal(false)
                        onBack()
                      }}
                    >
                      Volver al Inicio
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}