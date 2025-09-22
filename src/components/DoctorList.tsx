'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, User, Star, Phone, Mail, Award, Clock, Calendar } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'

interface DoctorListProps {
  specialtyId: string
  onSelectDoctor: (doctorId: string) => void
  onBack: () => void
}

export default function DoctorList({ specialtyId, onSelectDoctor, onBack }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        specialty:specialties(name)
      `)
      .eq('specialty_id', specialtyId)
      .eq('is_active', true)
    
    if (data) setDoctors(data)
    if (error) console.error('Error fetching doctors:', error)
    setLoading(false)
  }, [specialtyId])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Buscando los mejores especialistas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/*
