/**
 * Utilidades para el manejo correcto de fechas sin problemas de zona horaria
 * Este archivo centraliza todas las funciones de manejo de fechas para evitar
 * desfases entre la fecha guardada en la base de datos y la mostrada en la UI
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * Evita problemas de desfase que ocurren con toISOString()
 */
export function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
}

/**
 * Formatea una fecha en formato YYYY-MM-DD para mostrar en la UI
 * Sin problemas de zona horaria
 */
export function formatDateForDisplay(ymd: string): string {
  if (!ymd) return ymd
  
  try {
    // Parsear la fecha directamente sin crear objeto Date para evitar conversiones de zona horaria
    const [year, month, day] = ymd.split('-').map(Number)
    
    const weekdays = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
    
    // Crear fecha local directamente para obtener el día de la semana correcto
    const localDate = new Date(year, month - 1, day)
    const weekday = weekdays[localDate.getDay()]
    const monthName = months[month - 1]
    const dayStr = day.toString().padStart(2, '0')
    
    return `${weekday}, ${dayStr} ${monthName} ${year}`
  } catch (error) {
    console.error('Error formateando fecha:', ymd, error)
    return ymd
  }
}

/**
 * Formatea una fecha Date para enviar a la API en formato YYYY-MM-DD
 * Usa la zona horaria local para evitar desfases
 */
export function formatDateForAPI(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a un objeto Date local
 * Evita problemas de zona horaria al crear el objeto Date
 */
export function parseLocalDate(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Obtiene el día de la semana (0-6) para una fecha en formato YYYY-MM-DD
 * Usando zona horaria local
 */
export function getDayOfWeek(ymd: string): number {
  const localDate = parseLocalDate(ymd)
  return localDate.getDay()
}

/**
 * Valida si una fecha en formato YYYY-MM-DD es válida
 */
export function isValidDateString(ymd: string): boolean {
  if (!ymd || typeof ymd !== 'string') return false
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(ymd)) return false
  
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day
}