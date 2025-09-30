'use client'
import { useEffect, useState } from 'react'
import { Zap, Database } from 'lucide-react'

interface PerformanceIndicatorProps {
  isUsingCache?: boolean
  loadTime?: number
}

export default function PerformanceIndicator({ isUsingCache = false, loadTime }: PerformanceIndicatorProps) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    if (isUsingCache || loadTime) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isUsingCache, loadTime])
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
        isUsingCache 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}>
        {isUsingCache ? (
          <>
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Carga rápida desde caché</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">
              Cargado en {loadTime ? `${loadTime}ms` : 'menos de 1s'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}