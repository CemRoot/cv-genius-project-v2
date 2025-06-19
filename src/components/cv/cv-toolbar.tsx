"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Trash2, Settings } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { SettingsModalSimple } from "@/components/settings/settings-modal-simple"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useRouter } from "next/navigation"

interface CVToolbarProps {
  isMobile?: boolean
}

export function CVToolbar({ isMobile = false }: CVToolbarProps) {
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
      <div className={`${isMobile ? 'space-y-4' : 'flex items-center gap-1'}`}>
        {isMobile && (
          <h3 className="text-lg font-semibold text-gray-900">Design Controls</h3>
        )}
        
        <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-1'}`}>
          <Button 
            variant={isMobile ? "outline" : "ghost"} 
            size={isMobile ? "default" : "sm"} 
            onClick={handleUndo} 
            disabled={!canUndo}
            className={isMobile ? "flex items-center justify-center gap-2 touch-manipulation" : ""}
          >
            <Undo2 className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            {isMobile && "Undo"}
          </Button>
          
          <Button 
            variant={isMobile ? "outline" : "ghost"} 
            size={isMobile ? "default" : "sm"} 
            onClick={handleRedo} 
            disabled={!canRedo}
            className={isMobile ? "flex items-center justify-center gap-2 touch-manipulation" : ""}
          >
            <Redo2 className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            {isMobile && "Redo"}
          </Button>
          
          {!isMobile && <div className="w-px h-4 bg-border mx-1" />}
          
          <Button 
            variant={isMobile ? "outline" : "ghost"} 
            size={isMobile ? "default" : "sm"} 
            onClick={handleDelete}
            className={isMobile ? "flex items-center justify-center gap-2 touch-manipulation text-red-600 border-red-200 hover:bg-red-50" : ""}
          >
            <Trash2 className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            {isMobile && "Delete CV"}
          </Button>
          
          {!isMobile && <div className="w-px h-4 bg-border mx-1" />}
          
          <Button 
            variant={isMobile ? "cvgenius" : "ghost"} 
            size={isMobile ? "default" : "sm"} 
            onClick={handleSettings}
            className={isMobile ? "flex items-center justify-center gap-2 touch-manipulation" : ""}
          >
            <Settings className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            {isMobile && "Settings"}
          </Button>
        </div>
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