'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCVStore } from '@/store/cv-store'

export default function TestReferences() {
  const { currentCV, setReferencesDisplay, addReference, removeReference, toggleSectionVisibility } = useCVStore()
  const [displayMode, setDisplayMode] = useState(currentCV.referencesDisplay || 'available-on-request')

  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value as 'available-on-request' | 'detailed')
    setReferencesDisplay(value as 'available-on-request' | 'detailed')
  }

  const addTestReference = () => {
    addReference({
      name: 'John Doe',
      position: 'Senior Manager',
      company: 'Tech Company Ltd',
      email: 'john.doe@example.com',
      phone: '+353 87 123 4567',
      relationship: 'Direct Supervisor'
    })
  }

  const isReferencesVisible = currentCV.sections?.find(s => s.type === 'references')?.visible || false

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">References Section Test</h1>
      
      {/* Section Visibility */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Section Visibility</h2>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => toggleSectionVisibility('references')}
            variant={isReferencesVisible ? 'default' : 'outline'}
          >
            References Section: {isReferencesVisible ? 'Visible' : 'Hidden'}
          </Button>
          <span className="text-sm text-gray-600">
            (Current state: {isReferencesVisible ? '✅ Visible' : '❌ Hidden'})
          </span>
        </div>
      </Card>

      {/* Display Mode */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Display Mode</h2>
        <RadioGroup value={displayMode} onValueChange={handleDisplayModeChange}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="available-on-request" id="r1" />
            <Label htmlFor="r1">Show "References available upon request"</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="detailed" id="r2" />
            <Label htmlFor="r2">Show detailed reference contacts</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-600 mt-4">
          Current mode in store: <strong>{currentCV.referencesDisplay || 'available-on-request'}</strong>
        </p>
      </Card>

      {/* References Data */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">References Data</h2>
        <div className="space-y-4">
          <Button onClick={addTestReference} variant="outline">
            Add Test Reference
          </Button>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Current References ({currentCV.references?.length || 0}):</p>
            {currentCV.references?.map((ref, index) => (
              <div key={ref.id} className="p-3 bg-gray-50 rounded border">
                <p className="font-medium">{ref.name}</p>
                <p className="text-sm text-gray-600">{ref.position} at {ref.company}</p>
                <p className="text-sm text-gray-600">{ref.email} • {ref.phone}</p>
                <Button 
                  onClick={() => removeReference(ref.id)} 
                  variant="destructive" 
                  size="sm"
                  className="mt-2"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Preview State */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Preview State Check</h2>
        <div className="space-y-2 text-sm">
          <p>✓ Section Visible: {isReferencesVisible ? '✅ Yes' : '❌ No'}</p>
          <p>✓ Display Mode: {currentCV.referencesDisplay || 'available-on-request'}</p>
          <p>✓ Has References: {(currentCV.references?.length || 0) > 0 ? '✅ Yes' : '❌ No'}</p>
          <p>✓ Template: {currentCV.template || 'Not set'}</p>
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm font-medium text-amber-800">Expected Behavior:</p>
          <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
            <li>If section is visible + mode is "available-on-request" → Show "Available upon request"</li>
            <li>If section is visible + mode is "detailed" + has references → Show reference details</li>
            <li>If section is hidden → Nothing should appear in preview</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}