// Utility to clear CV builder storage data
export function clearCvBuilderStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cvbuilder_document')
    localStorage.removeItem('cvbuilder_autosave')
    console.log('CV Builder storage cleared')
  }
}

// Auto-clear on first load if needed
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const shouldClear = localStorage.getItem('cv_storage_version') !== 'v2'
  if (shouldClear) {
    clearCvBuilderStorage()
    localStorage.setItem('cv_storage_version', 'v2')
  }
}