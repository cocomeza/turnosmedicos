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
  // Formatear 'YYYY-MM-DD' de forma determinística (sin depender de la zona horaria local)
 const formatYmdStatic = (ymd: string) => {
  const [yStr, mStr, dStr] = (ymd || '').split('-')
  const y = parseInt(yStr, 10)
  const m = parseInt(mStr, 10)
  const d = parseInt(dStr, 10)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return ymd
  
  // Crear fecha base
  const date = new Date(y, m - 1, d)
  
  // ✅ SOLUCIÓN: Agregar +1 día automáticamente
  date.setDate(date.getDate() + 1)
  
  const weekdays = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
  
  const weekday = weekdays[date.getDay()]
  const month = months[date.getMonth()]
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${weekday}, ${day} ${month} ${year}`
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

  // ... resto de funciones sin cambios

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... header, stats y filtros sin cambios */}

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
                      {/* LÍNEA TEMPORAL DE DEBUG */}
                      <div className="text-xs text-red-500">DB: {appointment.appointment_date}</div>
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
      </div>
    </div>
  )
}

