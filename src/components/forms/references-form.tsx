"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2, Edit2, Save, X, User, Building } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { Reference } from "@/types/cv"

export function ReferencesForm() {
  const { currentCV, addReference, updateReference, removeReference, setReferencesDisplay } = useCVStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newReference, setNewReference] = useState<Omit<Reference, 'id'>>({
    name: '',
    position: '',
    company: '',
    email: '',
    phone: '',
    relationship: ''
  })

  const referencesDisplay = currentCV.referencesDisplay || 'available-on-request'

  const handleAddReference = () => {
    if (newReference.name.trim() && newReference.email.trim()) {
      addReference(newReference)
      setNewReference({
        name: '',
        position: '',
        company: '',
        email: '',
        phone: '',
        relationship: ''
      })
      setIsAdding(false)
      setReferencesDisplay('detailed')
    }
  }

  const handleRemoveReference = (id: string) => {
    removeReference(id)
    const currentReferences = currentCV.references || []
    if (currentReferences.length === 1) {
      setReferencesDisplay('available-on-request')
    }
  }

  const handleInputChange = (field: keyof Omit<Reference, 'id'>, value: string) => {
    setNewReference(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* References Display Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-cvgenius-primary" />
            References Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="available-upon-request"
                checked={referencesDisplay === 'available-on-request'}
                onChange={() => setReferencesDisplay('available-on-request')}
                className="h-4 w-4 text-cvgenius-primary"
              />
              <Label htmlFor="available-upon-request" className="text-sm">
                Show "References available upon request"
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="detailed-references"
                checked={referencesDisplay === 'detailed'}
                onChange={() => setReferencesDisplay('detailed')}
                className="h-4 w-4 text-cvgenius-primary"
              />
              <Label htmlFor="detailed-references" className="text-sm">
                Show detailed reference contacts
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed References List */}
      {referencesDisplay === 'detailed' && (
        <>
          {(currentCV.references || []).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-cvgenius-primary" />
                Your References ({(currentCV.references || []).length})
              </h3>
              
              <div className="space-y-4">
                {(currentCV.references || []).map((reference) => (
                  <Card key={reference.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{reference.name}</h4>
                          <p className="text-sm text-gray-600">{reference.position}</p>
                          <p className="text-sm text-gray-600">{reference.company}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">📧 {reference.email}</p>
                            {reference.phone && <p className="text-sm">📞 {reference.phone}</p>}
                            {reference.relationship && (
                              <p className="text-sm">🤝 {reference.relationship}</p>
                            )}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveReference(reference.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No References Message */}
          {(currentCV.references || []).length === 0 && !isAdding && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No references added yet</h3>
              <p className="text-gray-500 mb-4">Add professional references to strengthen your application</p>
            </div>
          )}

          {/* Add New Reference Form */}
          {isAdding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-cvgenius-primary" />
                  Add New Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="refName"
                      value={newReference.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refPosition">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="refPosition"
                      value={newReference.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="Senior Manager"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refCompany">Company</Label>
                    <Input
                      id="refCompany"
                      value={newReference.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="ABC Company Ltd."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="refEmail"
                      type="email"
                      value={newReference.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.smith@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refPhone">Phone</Label>
                    <Input
                      id="refPhone"
                      value={newReference.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+353 1 234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refRelationship">Relationship</Label>
                    <Input
                      id="refRelationship"
                      value={newReference.relationship}
                      onChange={(e) => handleInputChange('relationship', e.target.value)}
                      placeholder="Direct Manager"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAdding(false)
                      setNewReference({
                        name: '',
                        position: '',
                        company: '',
                        email: '',
                        phone: '',
                        relationship: ''
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddReference}
                    disabled={!newReference.name.trim() || !newReference.email.trim()}
                  >
                    Add Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Reference Button */}
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full border-dashed"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Reference
            </Button>
          )}
        </>
      )}

      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for References</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Most Irish employers prefer "References available upon request"</li>
          <li>• Only include detailed references if specifically requested</li>
          <li>• Typically 2-3 professional references are sufficient</li>
          <li>• Always ask permission before listing someone as a reference</li>
          <li>• Include former managers, colleagues, or professional contacts</li>
          <li>• Avoid personal references unless specifically asked</li>
        </ul>
      </div>
    </div>
  )
}