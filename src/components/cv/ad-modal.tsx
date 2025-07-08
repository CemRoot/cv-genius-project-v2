
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface AdModalProps {
  isOpen: boolean
  onClose: () => void
  onCountdownComplete: () => void
}

export function AdModal({ isOpen, onClose, onCountdownComplete }: AdModalProps) {
  const [countdown, setCountdown] = useState(5)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isOpen) {
      setCountdown(5)
      setProgress(100)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            onCountdownComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const progressTimer = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / 5)))
      }, 1000)

      return () => {
        clearInterval(timer)
        clearInterval(progressTimer)
      }
    }
  }, [isOpen, onCountdownComplete])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Destekleriniz için teşekkürler!</DialogTitle>
          <DialogDescription>
            CV'niz hazırlanıyor. İndirme işlemi birkaç saniye içinde başlayacak.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="h-32 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Reklam Alanı</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              İndirmeniz {countdown} saniye içinde başlayacak...
            </p>
            <Progress value={progress} className="w-full mt-2" />
          </div>
        </div>
        <Button onClick={onClose} variant="outline">
          İptal
        </Button>
      </DialogContent>
    </Dialog>
  )
}
