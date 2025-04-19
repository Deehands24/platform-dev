"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { FuturisticButton } from "./futuristic-button"
import { FocusTrap } from "@/components/ui/focus-trap"

interface NewDatabaseDialogProps {
  onDatabaseCreated?: (databaseId: number) => void
}

export function NewDatabaseDialog({ onDatabaseCreated }: NewDatabaseDialogProps) {
  const { createDatabase } = useStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Focus the name input when dialog opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // Small delay to ensure the dialog is rendered
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleCreateDatabase = () => {
    if (!name.trim()) {
      // Focus the name input if it's empty
      nameInputRef.current?.focus()
      return
    }

    const newDatabase = createDatabase(name, description)
    setName("")
    setDescription("")
    setIsOpen(false)

    if (onDatabaseCreated) {
      onDatabaseCreated(newDatabase.databaseId)
    }
  }

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on the dialog content
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  // If dialog is not open, just show the button
  if (!isOpen) {
    return (
      <FuturisticButton className="glass-button active-item" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Database
      </FuturisticButton>
    )
  }

  // If dialog is open, show the modal
  return (
    <>
      {/* Backdrop - fixed position to cover the entire screen */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog content - fixed position and centered */}
      <FocusTrap>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="fixed left-[50%] top-[40%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700/50 bg-gray-800/90 p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg glass-card"
          style={{ maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 id="dialog-title" className="text-lg font-semibold leading-none tracking-tight text-gray-100">
              Create New Database
            </h2>
            <p className="text-sm text-gray-300">Enter the details for your new database.</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="database-name" className="text-sm font-medium text-gray-200">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="database-name"
                ref={nameInputRef}
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Database name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="database-description" className="text-sm font-medium text-gray-200">
                Description
              </label>
              <Textarea
                id="database-description"
                className="glass-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Database description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <FuturisticButton variant="outline" onClick={() => setIsOpen(false)} className="mt-2 sm:mt-0">
              Cancel
            </FuturisticButton>
            <FuturisticButton onClick={handleCreateDatabase}>Create Database</FuturisticButton>
          </div>

          {/* Close button - positioned in the top right corner */}
          <button
            className="absolute right-4 top-4 rounded-full p-1 text-gray-300 opacity-70 hover:bg-gray-700/50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </FocusTrap>
    </>
  )
}
