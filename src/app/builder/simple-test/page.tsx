'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SimpleTestPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="w-[450px] bg-white border-r p-6">
        <h1 className="text-2xl font-bold mb-6">Simple Form Test</h1>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+353 87 123 4567"
              />
            </div>
            
            <Button className="w-full">Save</Button>
          </div>
        </Card>
      </div>
      
      {/* Right Panel */}
      <div className="flex-1 p-6">
        <Card className="h-full p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="bg-gray-50 rounded p-4">
            <p><strong>Name:</strong> {formData.fullName || 'Not provided'}</p>
            <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}