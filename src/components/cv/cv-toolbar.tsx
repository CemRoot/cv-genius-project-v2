"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Trash2, Settings } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { SettingsModalSimple } from "@/components/settings/settings-modal-simple"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useRouter } from "next/navigation"

export function CVToolbar() {
  const { currentCV, undo, redo, canUndo, canRedo, deleteCurrentCV } = useCVStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleUndo = () => {
    undo()
  }

  const handleRedo = () => {
    redo()
  }



  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      deleteCurrentCV()
      console.log('CV deleted successfully')
      
      // Optional: Show a brief success indication
      setTimeout(() => {
        console.log('CV has been reset to a new empty CV')
      }, 100)
    } catch (error) {
      console.error('Failed to delete CV:', error)
      throw error // Re-throw to handle in dialog
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleRedo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button variant="ghost" size="sm" onClick={handleSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <SettingsModalSimple 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete CV"
        description="Are you sure you want to delete this CV? This action cannot be undone."
        confirmText="Delete CV"
        cancelText="Cancel"
      />
    </>
  )
}