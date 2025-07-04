'use client'

import { useCVStore } from '@/store/cv-store'
import { useEffect, useState } from 'react'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

export default function TestDebugPage() {
  const { currentCV, sessionState, updateSessionState, setTemplate } = useCVStore()
  const [templateManager] = useState(() => new IrishCVTemplateManager())
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    console.log('Current CV Data:', currentCV)
    console.log('Session State:', sessionState)
    
    // Test template rendering with current CV template
    if (currentCV) {
      try {
        console.log('Testing template:', currentCV.template)
        const success = templateManager.selectTemplate(currentCV.template || 'harvard')
        console.log('Template selection success:', success)
        
        if (success) {
          const html = templateManager.renderCV(currentCV)
          const css = templateManager.getTemplateCSS()
          console.log('Generated HTML length:', html.length)
          console.log('Generated CSS length:', css.length)
          console.log('HTML preview:', html.substring(0, 500))
          
          setDebugInfo({
            templateSelected: success,
            htmlLength: html.length,
            cssLength: css.length,
            htmlPreview: html.substring(0, 500),
            renderError: null
          })
        }
      } catch (error) {
        console.error('Template render error:', error)
        setDebugInfo({
          templateSelected: false,
          renderError: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }, [currentCV, sessionState])
  
  const handleForceTemplateSync = () => {
    if (currentCV?.template) {
      updateSessionState({ selectedTemplateId: currentCV.template })
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CV Debug Page</h1>
      
      <div className="mb-4">
        <button 
          onClick={handleForceTemplateSync}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Force Template Sync
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session State:</h2>
          <pre className="text-sm">{JSON.stringify(sessionState || {}, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Personal Info:</h2>
          <pre className="text-sm">{JSON.stringify(currentCV?.personal || {}, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Template Debug Info:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">CV Template:</h2>
          <pre className="text-sm">{currentCV?.template || 'No template set'}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Expected Logic Check:</h2>
          <pre className="text-sm">{JSON.stringify({
            hasCurrentCV: !!currentCV,
            hasTemplate: !!currentCV?.template,
            templateValue: currentCV?.template,
            hasSessionTemplate: !!sessionState?.selectedTemplateId,
            sessionTemplateValue: sessionState?.selectedTemplateId,
            shouldShowTemplate: !!(currentCV?.template),
            shouldShowForm: !!(currentCV?.template)
          }, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Experience:</h2>
          <pre className="text-sm">{JSON.stringify(currentCV?.experience || [], null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Full CV Data:</h2>
          <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(currentCV, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}