export function formatMonthYear(dateStr?: string | null): string {
  // Return early for empty, null, or 'Present' values
  if (!dateStr || dateStr === 'Present' || dateStr === '') {
    return dateStr || ''
  }
  
  // Handle different date formats
  let d: Date
  
  // Check if it's already a valid date string
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // YYYY-MM-DD format
    d = new Date(dateStr + 'T00:00:00')
  } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    // DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/')
    d = new Date(`${year}-${month}-${day}T00:00:00`)
  } else {
    // Try default parsing
    d = new Date(dateStr)
  }
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return ''
  }
  
  // Check if year is reasonable (between 1900 and 9999)
  const year = d.getFullYear()
  if (year < 1900 || year > 9999) {
    return ''
  }
  
  try {
    return d.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })
  } catch (e) {
    return ''
  }
}

export function formatDayMonthYear(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' })
} 