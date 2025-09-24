'use client'
import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  UserPlus, 
  Mail, 
  Phone,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react'
import { format, setHours, setMinutes, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface AppointmentData {
  id?: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  doctor: {
    id: string
    name: string
    specialty: { name: string }
  }
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
}

interface Doctor {
  id: string
  name: string
  email: string
  specialty: { name: string }
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (appointmentData: any) => Promise<void>
  appointment?: AppointmentData | null
  mode: 'create' | 'edit'
}

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment, 
  mode 
}: AppointmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  })
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingTimes, setLoadingTimes] = useState(false)

  // Cargar doctores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
      if (mode === 'edit' && appointment) {
        // Pre-llenar formulario para edición
        setSelectedDoctor(appointment.doctor.id)
        setSelectedDate(new Date(appointment.appointment_date))
        setSelectedTime(appointment.appointment_time)
        setPatientData({
          name: appointment.patient.name,
          email: appointment.patient.email,
          phone: appointment.patient.phone,
          dateOfBirth: ''
        })
        setNotes(appointment.notes || '')
        setStatus(appointment.status)
      } else {
        // Limpiar formulario para creación
        resetForm()
      }
    }
  }, [isOpen, appointment, mode])

  // Cargar horarios disponibles cuando cambia la fecha o doctor
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableTimes()
    }
  }, [selectedDoctor, selectedDate])

  const resetForm = () => {
    setSelectedDoctor('')
    setSelectedDate(null)
    setSelectedTime('')
    setAvailableTimes([])
    setPatientData({ name: '', email: '', phone: '', dateOfBirth: '' })
    setNotes('')
    setStatus('scheduled')
    setError('')
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors)
      }
    } catch (err) {
      console.error('Error fetching doctors:', err)
    }
  }

  const fetchAvailableTimes = async () => {
    if (!selectedDoctor || !selectedDate) return

    setLoadingTimes(true)
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/admin/available-times?doctorId=${selectedDoctor}&date=${formattedDate}&excludeAppointmentId=${appointment?.id || ''}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAvailableTimes(data.availableTimes)
        
        // Si estamos editando y el tiempo actual no está en disponibles, agregarlo
        if (mode === 'edit' && appointment && selectedTime && !data.availableTimes.includes(selectedTime)) {
          setAvailableTimes([...data.availableTimes, selectedTime].sort())
        }
      } else {
        setAvailableTimes([])
      }
    } catch (err) {
      console.error('Error fetching available times:', err)
      setAvailableTimes([])
    } finally {
      setLoadingTimes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!selectedDoctor || !selectedDate || !selectedTime || !patientData.name || !patientData.email) {
        setError('Por favor completa todos los campos obligatorios')
        return
      }

      const appointmentData = {
        ...(mode === 'edit' && appointment?.id && { appointmentId: appointment.id }),
        doctorId: selectedDoctor,
        patientData,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        notes: notes.trim() || null,
        status
      }

      await onSave(appointmentData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cita')
    } finally {
      setLoading(false)
    }
  }

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-2 rounded-lg mr-3">
                        {mode === 'create' ? (
                          <UserPlus className="h-6 w-6 text-white" />
                        ) : (
                          <FileText className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          {mode === 'create' ? 'Crear Nueva Cita' : 'Editar Cita Médica'}
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm">
                          {mode === 'create' 
                            ? 'Registra una nueva cita en el sistema' 
                            : 'Modifica los datos de la cita existente'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna izquierda: Médico y horario */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                          <Stethoscope className="h-5 w-5 mr-2" />
                          Información Médica
                        </h3>
                        
                        {/* Selección de médico */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Médico *
                            </label>
                            <select
                              value={selectedDoctor}
                              onChange={(e) => setSelectedDoctor(e.target.value)}
                              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Seleccionar médico</option>
                              {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                  Dr. {doctor.name} - {doctor.specialty.name}
                                </option>
                              ))}
                            </select>
                            {selectedDoctorData && (
                              <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-700">
                                <strong>Especialidad:</strong> {selectedDoctorData.specialty.name}
                              </div>
                            )}
                          </div>

                          {/* Selección de fecha */}
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Fecha de la cita *
                            </label>
                            <div className="border border-blue-200 rounded-lg overflow-hidden">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => setSelectedDate(date)}
                                locale={es}
                                minDate={new Date()}
                                dateFormat="EEEE, d MMMM yyyy"
                                inline
                                className="w-full"
                                calendarClassName="w-full border-0"
                              />
                            </div>
                          </div>

                          {/* Selección de horario */}
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Horario *
                            </label>
                            {loadingTimes ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader className="h-6 w-6 animate-spin text-blue-600" />
                                <span className="ml-2 text-blue-600">Cargando horarios...</span>
                              </div>
                            ) : selectedDate ? (
                              <div>
                                <div className="grid grid-cols-3 gap-2">
                                  {availableTimes.map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setSelectedTime(time)}
                                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                                        selectedTime === time
                                          ? 'bg-blue-500 text-white border-blue-500'
                                          : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                                {availableTimes.length === 0 && (
                                  <p className="text-center py-4 text-blue-600 text-sm">
                                    No hay horarios disponibles para esta fecha
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-center py-4 text-blue-600 text-sm">
                                Selecciona una fecha para ver horarios disponibles
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estado (solo para edición) */}
                      {mode === 'edit' && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Estado de la cita
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="scheduled">Programada</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha: Información del paciente */}
                    <div className="space-y-6">
                      <div className="bg-green-50 p-4 rounded-xl">
                        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Información del Paciente
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              Nombre completo *
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                              <input
                                type="text"
                                value={patientData.name}
                                onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Nombre del paciente"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                              <input
                                type="email"
                                value={patientData.email}
                                onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="correo@ejemplo.com"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              Teléfono
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                              <input
                                type="tel"
                                value={patientData.phone}
                                onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="+54 11 1234-5678"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              Fecha de nacimiento
                            </label>
                            <input
                              type="date"
                              value={patientData.dateOfBirth}
                              onChange={(e) => setPatientData({...patientData, dateOfBirth: e.target.value})}
                              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notas */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                          Notas adicionales
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Observaciones, síntomas, o información adicional..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !selectedDoctor || !selectedDate || !selectedTime || !patientData.name || !patientData.email}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin inline mr-2" />
                          {mode === 'create' ? 'Creando...' : 'Guardando...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 inline mr-2" />
                          {mode === 'create' ? 'Crear Cita' : 'Guardar Cambios'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
