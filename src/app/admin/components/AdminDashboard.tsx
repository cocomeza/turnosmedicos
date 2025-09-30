'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LogOut, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Home,
  Plus,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { AdminUser } from '../../../lib/admin-auth'
import { formatDateForDisplay, getTodayString, fixDateFromDatabase, debugDateProblem } from '../../../lib/date-utils'
import { debugDateIssues, testDateFormatting } from '../../../lib/debug-dates-browser'

interface AdminDashboardProps {
  adminUser: AdminUser
}

interface AppointmentData {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  doctor: {
    id: string
    name: string
    email: string
    phone: string
    specialty: {
      name: string
    }
  }
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
}

interface Stats {
  total: number
  today: number
  scheduled: number
  completed: number
}

interface Doctor {
  id: string
  name: string
  email: string
  specialty: {
    name: string
  }
}

interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

interface CreateAppointmentForm {
  doctorId: string
  patientId: string
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  appointmentDate: string
  appointmentTime: string
  notes: string
}

export default function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, scheduled: 0, completed: 0 })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtros
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentData | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<AppointmentData | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)
  
  // Usar función centralizada para formateo de fechas con depuración y corrección
  const formatYmdStatic = (ymd: string) => {
    console.log(`🔍 Formateando fecha: ${ymd}`)
    
    // Depurar el problema específico
    debugDateProblem(ymd, 'AdminDashboard')
    
    // Corregir la fecha si viene de la base de datos
    const correctedDate = fixDateFromDatabase(ymd)
    
    // Formatear para mostrar
    const result = formatDateForDisplay(correctedDate)
    console.log(`📅 Resultado final: ${result}`)
    
    // Depuración adicional
    const testResult = testDateFormatting(ymd)
    if (testResult.hasIssue) {
      console.warn(`⚠️ PROBLEMA DETECTADO con fecha ${ymd}:`, testResult)
    }
    
    return result
  }
  
  // Formulario de crear/editar cita
  const [appointmentForm, setAppointmentForm] = useState<CreateAppointmentForm>({
    doctorId: '',
    patientId: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  })
  
  const router = useRouter()

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats, doctors, appointments and patients
      const [statsRes, appointmentsRes, patientsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/appointments?page=${currentPage}&search=${encodeURIComponent(search)}&status=${statusFilter}&doctorId=${doctorFilter}&startDate=${dateFromFilter}&endDate=${dateToFilter}`),
        fetch('/api/admin/patients')
      ])

      if (!statsRes.ok || !appointmentsRes.ok || !patientsRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const statsData = await statsRes.json()
      const appointmentsData = await appointmentsRes.json()
      const patientsData = await patientsRes.json()

      setStats(statsData.stats)
      setDoctors(statsData.doctors)
      
      // Depurar las fechas que vienen de la API
      console.log('📊 Datos de citas recibidos:', appointmentsData.appointments)
      if (appointmentsData.appointments && appointmentsData.appointments.length > 0) {
        appointmentsData.appointments.forEach((appointment: AppointmentData, index: number) => {
          console.log(`📅 Cita ${index + 1}:`, {
            id: appointment.id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            patient: appointment.patient?.name
          })
          debugDateProblem(appointment.appointment_date, `Cita ${index + 1}`)
        })
      }
      
      setAppointments(appointmentsData.appointments)
      setTotalPages(appointmentsData.totalPages)
      setPatients(patientsData.patients)
    } catch (err) {
      setError('Error al cargar los datos del panel')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Depuración temporal de fechas
    debugDateIssues()
    
    // Probar con fechas específicas
    testDateFormatting('2024-01-30')
    testDateFormatting('2024-12-31')
    testDateFormatting('2024-02-29')
    
    fetchData()
  }, [currentPage, search, statusFilter, doctorFilter, dateFromFilter, dateToFilter])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      })

      if (response.ok) {
        await fetchData() // Recargar datos
      } else {
        throw new Error('Error al actualizar')
      }
    } catch (err) {
      alert('Error al actualizar la cita')
    }
  }

  // Nuevas funciones para CRUD completo
  const fetchAvailableTimes = async (doctorId: string, date: string) => {
    try {
      const response = await fetch(`/api/admin/available-times?doctorId=${doctorId}&date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableTimes(data.availableTimes)
      } else {
        setAvailableTimes([])
      }
    } catch (err) {
      console.error('Error fetching available times:', err)
      setAvailableTimes([])
    }
  }

  const handleCreateAppointment = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setFormLoading(true)
    try {
      let patientId = appointmentForm.patientId

      // Si es un nuevo paciente, crearlo primero
      if (!patientId && appointmentForm.patientName && appointmentForm.patientEmail) {
        const patientResponse = await fetch('/api/admin/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: appointmentForm.patientName,
            email: appointmentForm.patientEmail,
            phone: appointmentForm.patientPhone
          })
        })

        if (patientResponse.ok) {
          const patientData = await patientResponse.json()
          patientId = patientData.patient.id
        } else {
          const error = await patientResponse.json()
          throw new Error(error.error)
        }
      }

      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: appointmentForm.doctorId,
          patientId: patientId,
          appointmentDate: appointmentForm.appointmentDate,
          appointmentTime: appointmentForm.appointmentTime,
          notes: appointmentForm.notes
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        await fetchData()
        alert('Cita creada exitosamente')
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (err: any) {
      alert(err.message || 'Error al crear la cita')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditAppointment = async () => {
    if (!editingAppointment || !appointmentForm.doctorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setFormLoading(true)
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: editingAppointment.id,
          doctorId: appointmentForm.doctorId,
          patientId: appointmentForm.patientId,
          appointmentDate: appointmentForm.appointmentDate,
          appointmentTime: appointmentForm.appointmentTime,
          notes: appointmentForm.notes
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingAppointment(null)
        resetForm()
        await fetchData()
        alert('Cita actualizada exitosamente')
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar la cita')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!deletingAppointment) return

    setFormLoading(true)
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: deletingAppointment.id })
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setDeletingAppointment(null)
        await fetchData()
        alert('Cita eliminada exitosamente')
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la cita')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (appointment: AppointmentData) => {
    setEditingAppointment(appointment)
    setAppointmentForm({
      doctorId: appointment.doctor.id,
      patientId: appointment.patient.id,
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      patientPhone: appointment.patient.phone,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      notes: appointment.notes || ''
    })
    // Fetch available times for the selected doctor and date
    fetchAvailableTimes(appointment.doctor.id, appointment.appointment_date)
    setShowEditModal(true)
  }

  const openDeleteModal = (appointment: AppointmentData) => {
    setDeletingAppointment(appointment)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setAppointmentForm({
      doctorId: '',
      patientId: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      appointmentDate: '',
      appointmentTime: '',
      notes: ''
    })
    setAvailableTimes([])
  }

  // Handle form changes
  const handleFormChange = (field: keyof CreateAppointmentForm, value: string) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }))

    // If doctor or date changes, fetch available times
    if (field === 'doctorId' || field === 'appointmentDate') {
      const doctorId = field === 'doctorId' ? value : appointmentForm.doctorId
      const date = field === 'appointmentDate' ? value : appointmentForm.appointmentDate
      
      if (doctorId && date) {
        fetchAvailableTimes(doctorId, date)
      } else {
        setAvailableTimes([])
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      scheduled: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {adminUser.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Volver al Home
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Citas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Primera fila: Búsqueda y filtros básicos */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por paciente..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Todos los estados</option>
                  <option value="scheduled">Programadas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
                
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todos los médicos</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={openCreateModal}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Cita
              </button>
            </div>

            {/* Segunda fila: Filtros de fecha */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por fecha:</span>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <label className="text-sm text-gray-600">Desde:</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <label className="text-sm text-gray-600">Hasta:</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {(dateFromFilter || dateToFilter) && (
                <button
                  onClick={() => {
                    setDateFromFilter('')
                    setDateToFilter('')
                  }}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Citas Médicas</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatYmdStatic(appointment.appointment_date)}</div>
                        <div className="text-gray-500">{appointment.appointment_time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{appointment.patient.name}</div>
                        <div className="text-gray-500">{appointment.patient.email}</div>
                        <div className="text-gray-500">{appointment.patient.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">Dr. {appointment.doctor.name}</div>
                        <div className="text-gray-500">{appointment.doctor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.doctor.specialty.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        {/* Botones principales de CRUD */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(appointment)}
                            className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => openDeleteModal(appointment)}
                            className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-xs font-medium transition-colors"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </button>
                        </div>
                        
                        {/* Botones de estado */}
                        <div className="flex space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors"
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="text-orange-600 hover:text-orange-800 text-xs font-medium hover:bg-orange-50 px-2 py-1 rounded transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {appointment.status === 'cancelled' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'scheduled')}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                              Reactivar
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal para Crear Nueva Cita */}
      <Transition appear show={showCreateModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCreateModal(false)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Crear Nueva Cita Médica
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    {/* Selección de Doctor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                      <select
                        value={appointmentForm.doctorId}
                        onChange={(e) => handleFormChange('doctorId', e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Seleccionar doctor...</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} - {doctor.specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selección/Creación de Paciente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                      <select
                        value={appointmentForm.patientId}
                        onChange={(e) => handleFormChange('patientId', e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Crear nuevo paciente...</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} - {patient.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campos para nuevo paciente */}
                    {!appointmentForm.patientId && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                          <input
                            type="text"
                            value={appointmentForm.patientName || ''}
                            onChange={(e) => handleFormChange('patientName', e.target.value)}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={appointmentForm.patientEmail || ''}
                            onChange={(e) => handleFormChange('patientEmail', e.target.value)}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                          <input
                            type="tel"
                            value={appointmentForm.patientPhone || ''}
                            onChange={(e) => handleFormChange('patientPhone', e.target.value)}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input
                          type="date"
                          value={appointmentForm.appointmentDate}
                          onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                          min={getTodayString()}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                        <select
                          value={appointmentForm.appointmentTime}
                          onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Seleccionar hora...</option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                      <textarea
                        value={appointmentForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => setShowCreateModal(false)}
                      disabled={formLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                      onClick={handleCreateAppointment}
                      disabled={formLoading}
                    >
                      {formLoading && (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      )}
                      <Save className="h-4 w-4 mr-1" />
                      Crear Cita
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal para Editar Cita */}
      <Transition appear show={showEditModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowEditModal(false)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Editar Cita Médica
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    {/* Información del Paciente (solo lectura) */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Paciente</h4>
                      <p className="text-sm text-gray-900">{appointmentForm.patientName}</p>
                      <p className="text-sm text-gray-500">{appointmentForm.patientEmail}</p>
                    </div>

                    {/* Selección de Doctor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                      <select
                        value={appointmentForm.doctorId}
                        onChange={(e) => handleFormChange('doctorId', e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Seleccionar doctor...</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} - {doctor.specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input
                          type="date"
                          value={appointmentForm.appointmentDate}
                          onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                          min={getTodayString()}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                        <select
                          value={appointmentForm.appointmentTime}
                          onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Seleccionar hora...</option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                      <textarea
                        value={appointmentForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => setShowEditModal(false)}
                      disabled={formLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                      onClick={handleEditAppointment}
                      disabled={formLoading}
                    >
                      {formLoading && (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      )}
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Cambios
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Confirmación para Eliminar */}
      <Transition appear show={showDeleteModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
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
                    Confirmar Eliminación
                  </Dialog.Title>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      ¿Estás seguro de que deseas eliminar permanentemente esta cita médica?
                    </p>
                    
                    {deletingAppointment && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-900">
                            Paciente: {deletingAppointment.patient.name}
                          </p>
                          <p className="text-sm text-red-700">
                            Doctor: Dr. {deletingAppointment.doctor.name}
                          </p>
                          <p className="text-sm text-red-700">
                            Fecha: {formatYmdStatic(deletingAppointment.appointment_date)} a las {deletingAppointment.appointment_time}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-4">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={formLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                      onClick={handleDeleteAppointment}
                      disabled={formLoading}
                    >
                      {formLoading && (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      )}
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
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

